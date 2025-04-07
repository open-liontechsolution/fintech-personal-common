/**
 * Cliente RabbitMQ estandarizado
 * Proporciona una interfaz común para publicar y consumir mensajes
 */
import amqp, { Channel, ConsumeMessage } from 'amqplib';
import { ExternalServiceError } from '../errors/app-error';
import { FileProcessingEvent } from '../../schemas/events/file-events';

/**
 * Opciones para la conexión a RabbitMQ
 */
export interface RabbitMQOptions {
  url: string;
  exchange: string;
  exchangeType: 'direct' | 'topic' | 'fanout' | 'headers';
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * Opciones para el consumo de mensajes
 */
export interface ConsumeOptions {
  queue: string;
  routingKey: string;
  prefetch?: number;
  durable?: boolean;
  autoDelete?: boolean;
}

/**
 * Opciones para la publicación de mensajes
 */
export interface PublishOptions {
  routingKey: string;
  persistent?: boolean;
  messageId?: string;
  correlationId?: string;
  timestamp?: number;
  expiration?: string;
}

/**
 * Manejador de mensajes
 */
export type MessageHandler<T> = (message: T, originalMessage: ConsumeMessage) => Promise<void>;

/**
 * Cliente RabbitMQ
 */
export class RabbitMQClient {
  private connection: any = null; // Using any type to resolve typing issues with amqplib
  private channel: Channel | null = null;
  private reconnectAttempts = 0;
  private options: RabbitMQOptions;
  private consumers: Map<string, { queue: string, handler: MessageHandler<any> }> = new Map();
  private connecting = false;

  /**
   * Constructor
   * @param options Opciones de conexión
   */
  constructor(options: RabbitMQOptions) {
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...options
    };
  }

  /**
   * Conecta al servidor RabbitMQ
   */
  async connect(): Promise<void> {
    if (this.connection || this.connecting) return;

    try {
      this.connecting = true;
      this.connection = await amqp.connect(this.options.url);
      
      if (this.connection) {
        this.connection.on('error', (err: Error) => {
          console.error('RabbitMQ connection error:', err.message);
          this.reconnect();
        });
        
        this.connection.on('close', () => {
          console.warn('RabbitMQ connection closed');
          this.reconnect();
        });
        
        this.channel = await this.connection.createChannel();
        
        if (this.channel) {
          // Crear exchange
          await this.channel.assertExchange(
            this.options.exchange,
            this.options.exchangeType,
            { durable: true }
          );
          
          // Restaurar consumidores
          for (const [consumerTag, consumer] of this.consumers) {
            await this.setupConsumer(consumer.queue, consumer.handler, consumerTag);
          }
        }
      }
      
      this.reconnectAttempts = 0;
      this.connecting = false;
      
      console.log('Conectado a RabbitMQ');
    } catch (error) {
      this.connecting = false;
      console.error('Error al conectar con RabbitMQ:', error);
      this.reconnect();
    }
  }

  /**
   * Reconecta al servidor RabbitMQ
   */
  private reconnect(): void {
    if (this.connecting) return;
    
    this.connection = null;
    this.channel = null;
    
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 10)) {
      console.error('Número máximo de intentos de reconexión alcanzado');
      return;
    }
    
    this.reconnectAttempts++;
    
    setTimeout(() => {
      console.log(`Intentando reconectar a RabbitMQ (intento ${this.reconnectAttempts})...`);
      this.connect();
    }, this.options.reconnectInterval);
  }

  /**
   * Publica un mensaje en el exchange
   * @param message Mensaje a publicar
   * @param options Opciones de publicación
   */
  async publish<T extends FileProcessingEvent>(message: T, options: PublishOptions): Promise<boolean> {
    if (!this.channel) {
      await this.connect();
      if (!this.channel) {
        throw new ExternalServiceError('No se pudo conectar a RabbitMQ');
      }
    }
    
    try {
      const buffer = Buffer.from(JSON.stringify(message));
      
      return this.channel.publish(
        this.options.exchange,
        options.routingKey,
        buffer,
        {
          persistent: options.persistent !== false,
          messageId: options.messageId,
          correlationId: options.correlationId,
          timestamp: options.timestamp || Math.floor(Date.now() / 1000),
          expiration: options.expiration,
          contentType: 'application/json',
          contentEncoding: 'utf-8',
        }
      );
    } catch (error) {
      console.error('Error al publicar mensaje:', error);
      throw new ExternalServiceError(`Error al publicar mensaje: ${(error as Error).message}`);
    }
  }

  /**
   * Configura un consumidor para una cola
   * @param queue Nombre de la cola
   * @param handler Manejador de mensajes
   * @param consumerTag Etiqueta del consumidor
   */
  private async setupConsumer<T>(
    queue: string,
    handler: MessageHandler<T>,
    consumerTag: string
  ): Promise<void> {
    if (!this.channel) return;
    
    try {
      await this.channel.consume(
        queue,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;
          
          try {
            const content = msg.content.toString();
            const parsedContent = JSON.parse(content) as T;
            
            await handler(parsedContent, msg);
            this.channel?.ack(msg);
          } catch (error) {
            console.error(`Error procesando mensaje: ${(error as Error).message}`);
            // Rechazar el mensaje y enviarlo a la cola de mensajes muertos
            this.channel?.nack(msg, false, false);
          }
        },
        { consumerTag }
      );
    } catch (error) {
      console.error(`Error configurando consumidor: ${(error as Error).message}`);
    }
  }

  /**
   * Consume mensajes de una cola
   * @param options Opciones de consumo
   * @param handler Manejador de mensajes
   */
  async consume<T>(
    options: ConsumeOptions,
    handler: MessageHandler<T>
  ): Promise<string> {
    if (!this.channel) {
      await this.connect();
      if (!this.channel) {
        throw new ExternalServiceError('No se pudo conectar a RabbitMQ');
      }
    }
    
    try {
      // Crear cola
      await this.channel.assertQueue(options.queue, {
        durable: options.durable !== false,
        autoDelete: options.autoDelete || false,
      });
      
      // Vincular cola al exchange
      await this.channel.bindQueue(
        options.queue,
        this.options.exchange,
        options.routingKey
      );
      
      // Establecer prefetch
      if (options.prefetch) {
        await this.channel.prefetch(options.prefetch);
      }
      
      // Generar etiqueta de consumidor
      const consumerTag = `${options.queue}-${Date.now()}`;
      
      // Configurar consumidor
      await this.setupConsumer(options.queue, handler, consumerTag);
      
      // Guardar consumidor para reconexiones
      this.consumers.set(consumerTag, {
        queue: options.queue,
        handler
      });
      
      return consumerTag;
    } catch (error) {
      console.error('Error al configurar consumidor:', error);
      throw new ExternalServiceError(`Error al configurar consumidor: ${(error as Error).message}`);
    }
  }

  /**
   * Cancela un consumidor
   * @param consumerTag Etiqueta del consumidor
   */
  async cancelConsumer(consumerTag: string): Promise<void> {
    if (!this.channel) return;
    
    try {
      await this.channel.cancel(consumerTag);
      this.consumers.delete(consumerTag);
    } catch (error) {
      console.error(`Error cancelando consumidor: ${(error as Error).message}`);
    }
  }

  /**
   * Cierra la conexión
   */
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      
      if (this.connection) {
        await this.connection.close();
      }
      
      this.channel = null;
      this.connection = null;
      this.consumers.clear();
      
      console.log('Conexión con RabbitMQ cerrada');
    } catch (error) {
      console.error('Error al cerrar conexión con RabbitMQ:', error);
    }
  }
}
