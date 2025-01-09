import OpenAI from 'openai';
import { supabase } from './supabase';
import { rateLimit } from './rateLimit';

// Initialize OpenAI with error handling
const createOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.warn('OpenAI API key not configured');
    return null;
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

// Rate limiting configuration
const MAX_REQUESTS_PER_MINUTE = 20;
const rateLimiter = rateLimit(MAX_REQUESTS_PER_MINUTE, 60 * 1000);

export interface ChatMessage {
  id: string;
  userId: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export class ChatbotService {
  private static instance: ChatbotService;
  private openai: OpenAI | null = null;
  private context: string = `You are a helpful healthcare assistant for CareSync Hub. 
  You can help with appointments, billing, and general healthcare information.
  Keep responses concise and professional.
  
  When users ask about:
  - Scheduling appointments: Tell them you'll help and redirect them to the appointments page
  - Contact information: Direct them to the contact page
  - Billing questions: Provide basic info and direct them to the billing page
  - Medical advice: Remind them this is not a substitute for professional medical advice`;

  private constructor() {
    this.openai = createOpenAIClient();
  }

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  async getResponse(userId: string, message: string): Promise<string> {
    try {
      // Validate inputs
      if (!userId || !message.trim()) {
        throw new Error('Invalid input parameters');
      }

      if (!this.openai) {
        return "I'm currently unavailable. Please contact support for assistance.";
      }

      // Check rate limit
      if (!rateLimiter.tryRequest()) {
        return "I'm receiving too many messages right now. Please wait a moment and try again.";
      }

      // Save user message
      try {
        await this.saveMessage(userId, 'user', message);
      } catch (error) {
        console.error('Error saving user message:', error);
        // Continue even if save fails
      }

      // Get conversation history
      let history: ChatMessage[] = [];
      try {
        history = await this.getConversationHistory(userId, 5);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        // Continue with empty history if fetch fails
      }

      // Generate AI response
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.context },
          ...history.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: "user", content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 
        "I apologize, but I'm having trouble processing your request.";

      // Save bot response
      try {
        await this.saveMessage(userId, 'bot', response);
      } catch (error) {
        console.error('Error saving bot response:', error);
        // Continue even if save fails
      }

      return response;

    } catch (error: any) {
      console.error('Chatbot error:', error);
      
      // Handle specific error cases
      if (error.message.includes('OpenAI API key not configured')) {
        return "I'm currently unavailable. Please contact support for assistance.";
      }

      if (error.message.includes('Rate limit')) {
        return "I'm receiving too many messages right now. Please wait a moment and try again.";
      }

      if (error.code === 'invalid_api_key' || error.message.includes('API key')) {
        return "I'm currently unavailable due to a configuration issue. Please contact support.";
      }

      // Generic error response
      return "I apologize, but I'm having trouble processing your request. Please try again later.";
    }
  }

  private async saveMessage(userId: string, type: 'user' | 'bot', content: string): Promise<void> {
    if (!userId || !content.trim()) {
      throw new Error('Invalid message parameters');
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        type,
        content,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  private async getConversationHistory(userId: string, limit: number = 5): Promise<ChatMessage[]> {
    if (!userId) {
      throw new Error('Invalid user ID');
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }

    return (data || []).map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      type: msg.type,
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    }));
  }
}