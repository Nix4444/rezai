import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import Chain from './rezChain';
import { PrismaClient } from "../../frontend/node_modules/.prisma/client";
import jwt from 'jsonwebtoken';

enum MessageType {
  INIT_CHAIN = 'initializeChain',
  CHAIN_INITIALIZED = 'chainInitialized',
  MESSAGE = 'message',
  RESPONSE = 'response',
  ERROR = 'error'
}


interface WebSocketMessage {
  type: MessageType;
  data: any;
}


interface MessageData {
  message: string;
}


class ClientConnection {
  private isChainRunning: boolean = false;
  private isInitialized: boolean = false;
  private userId: string | null = null;

  constructor(private ws: WebSocket) {}


  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  async handleMessage(message: string): Promise<void> {
    
    try {
      const parsedMessage = JSON.parse(message) as WebSocketMessage;
      
      switch (parsedMessage.type) {
        case MessageType.INIT_CHAIN:
          await this.initializeChain();
          break;
        
        case MessageType.MESSAGE:
          await this.handleClientMessage(parsedMessage.data);
          break;
        
        default:
          console.warn(`Unknown message type: ${parsedMessage.type}`);
          this.sendError(`Unknown message type: ${parsedMessage.type}`);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      this.sendError('Invalid message format');
    }
  }

  private async initializeChain(): Promise<void> {
    try {
      if (this.isInitialized) {
        this.send({
          type: MessageType.CHAIN_INITIALIZED,
          data: { message: 'Ready' }
        });
        return;
      }
      
      
      
      try {

        
        this.isInitialized = true;
        
        this.send({
          type: MessageType.CHAIN_INITIALIZED,
          data: { message: 'Ready' }
        });
        
      } catch (error) {
        this.isInitialized = false;
        this.sendError('Failed to initialize chain. Please try again.');
        throw error;
      }
    } catch (error) {
      this.isInitialized = false;
      this.sendError('Failed to initialize chain');
      throw error;
    }
  }

  private async handleClientMessage(data: MessageData): Promise<void> {
    if (!this.isInitialized) {
      console.error('Chain not initialized. Initializing now.');
      try {
        await this.initializeChain();
      } catch (error) {
        console.error('Failed to initialize chain:', error);
        this.sendError('Error initializing. Please refresh and try again.');
        return;
      }
    }

    try {
     
      if (!this.isChainRunning) {
        this.isChainRunning = true;
        

        

        try {
          const response = await this.handleChain1(data.message);
          
   
          this.send({
            type: MessageType.RESPONSE,
            data: { result: JSON.parse(response) }
          });
        } catch (chainError: unknown) {
          console.error('Error in chain process:', chainError);
          this.sendError(`Sorry, there was an error. Please try again.`);
        } finally {
          this.isChainRunning = false;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      this.sendError('Failed to process message');
      this.isChainRunning = false;
    }
  }


  private async handleChain1(message: string): Promise<string> {
    

    if (!this.userId) {
      console.warn('Warning: No userId available in handleChain1 - resume will not be saved to database');
    }
    
    return new Promise(async (resolve, reject) => {
      try {

        let currentPrompt: string | null = null;
        let promptResolve: ((value: string) => void) | null = null;
        

        const inputHandler = async (prompt: string): Promise<string> => {
          return new Promise<string>((resolve, reject) => {
            try {

              const requiresResponse = prompt.includes("?") || 
                                      /tell me|share|provide|what|how|where|when|describe|explain/i.test(prompt) &&
                                      !prompt.includes("I've completed") &&
                                      !prompt.includes("Thank you") &&
                                      !prompt.includes("successfully");
                                      
              

              if (requiresResponse) {
                currentPrompt = prompt;
                promptResolve = resolve;
              }
              this.send({
                type: MessageType.MESSAGE,
                data: { 
                  message: prompt,
                  requiresResponse: requiresResponse 
                }
              });
              
              if (!requiresResponse) {
                
                setTimeout(() => {
                  resolve("acknowledged");
                }, 1000);
                return;
              }
              
            } catch (error) {
              console.error('Error in inputHandler:', error);
              reject(error);
            }
          });
        };
        

        const messageHandler = (event: WebSocket.MessageEvent) => {
          try {
            
            const data = JSON.parse(event.data.toString()) as WebSocketMessage;
            

            if (data.type === MessageType.MESSAGE && currentPrompt && promptResolve) {
              
              if ((promptResolve as any).timeoutId) {
                clearTimeout((promptResolve as any).timeoutId);
              }
              
              promptResolve(data.data.message);
              currentPrompt = null;
              promptResolve = null;
              
              return true;
            }
           
            return false;
          } catch (error) {
            console.error('Error processing message in temporary handler:', error);
            return false;
          }
        };
        

        const originalOnMessage = this.ws.onmessage;

        this.ws.onmessage = (event) => {
          const handled = messageHandler(event);
          
          if (!handled && originalOnMessage) {
            originalOnMessage(event);
          }
        };
        
        try {


          const result = await Chain(inputHandler);

          

          this.ws.onmessage = originalOnMessage;
          

          if (result && typeof result.saveToDatabase === 'function' && this.userId) {
            try {
              const savedUser = await result.saveToDatabase(this.userId);
            } catch (error: any) {
              this.sendError(`Error saving resume data: ${error.message}`);
            }
          } else if (result && typeof result.saveToDatabase === 'function' && !this.userId) {
            this.sendError('Cannot save resume data: Please log in or provide a valid authentication token');
          }
          
          this.send({
            type: MessageType.RESPONSE,
            data: { 
              result 
            }
          });
          
          resolve(JSON.stringify(result));
        } catch (chainError: unknown) {
          this.ws.onmessage = originalOnMessage;
          
          console.error('Error in Chain 1:', chainError);
          const errorMessage = chainError instanceof Error ? chainError.message : 'Unknown error in Chain 1';
          this.sendError(errorMessage);
          reject(errorMessage);
        }
      } catch (error: unknown) {
        console.error('Critical error in handleChain1:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown critical error';
        this.sendError('Critical error executing chain 1. Check server logs for details.');
        reject(errorMessage);
      }
    });
  }

  private send(message: WebSocketMessage): void {
    try {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private sendError(message: string): void {
    try {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: MessageType.ERROR,
          data: { message }
        }));
      }
    } catch (error) {
      console.error('Error sending error message:', error);
    }
  }
  
  close(): void {

    this.isInitialized = false;
    this.isChainRunning = false;
  }
}

export function setupWebSocketServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server });
  const prisma = new PrismaClient();
  
  
  wss.on('connection', async (ws: WebSocket, req: http.IncomingMessage) => {
    
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    
    let userId: string | null = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET as string) as { id?: string, sub?: string };
        userId = decoded.id || decoded.sub || null;
        
        if (userId) {
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'User ID not found in token' }));
        }
      } catch (error) {

        ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed: Invalid token' }));
      }
    } else {

      ws.send(JSON.stringify({ type: 'error', message: 'Authentication token required' }));
    }
    
    const state = {
      messages: [] as any[],
      obj: {} as Record<string, string>,
      userId
    };
    
    const client = new ClientConnection(ws);

    client.setUserId(userId);
    
    

    const originalHandleMessage = client.handleMessage.bind(client);
    

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.ping();
        } catch (error) {
          console.error('Error pinging client:', error);
        }
      }
    }, 30000); 
    

    ws.on('message', async (message: WebSocket.Data) => {
      try {
        await originalHandleMessage(message.toString());
      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to process message'
        }));
      }
    });
    
    ws.on('close', () => {
      clearInterval(pingInterval);
      client.close();
    });
    

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(pingInterval);
    });
    
    
  });
  
  return wss;
} 