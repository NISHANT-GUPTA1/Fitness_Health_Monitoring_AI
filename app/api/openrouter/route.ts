"use server"

import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API endpoint - ensure URL is correct
const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

// API key from environment variables
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";

// Utility function to check if network connectivity to OpenRouter is working
async function checkOpenRouterConnectivity(): Promise<boolean> {
  try {
    // Try a simple ping to the domain rather than a full API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // Use a HEAD request to just check connectivity without transferring data
    const response = await fetch("https://openrouter.ai/", {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("OpenRouter connectivity check failed:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // First check if we can connect to OpenRouter at all
    const isConnected = await checkOpenRouterConnectivity();
    
    if (!isConnected) {
      console.error("Cannot connect to OpenRouter API - network connectivity issue");
      return NextResponse.json(
        { 
          error: 'API connectivity error',
          message: 'Cannot connect to OpenRouter API. Using fallback responses instead.',
          networkError: true
        },
        { status: 503 }
      );
    }
    
    // Parse the request body
    const requestData = await request.json();
    
    console.log('API route received request:', JSON.stringify(requestData, null, 2));
    
    // Use the model name from the request or default to Qwen
    const modelName = requestData.model || "qwen/qwen3-235b-a22b-2507";
    
    // Build the request to OpenRouter
    const openRouterRequest = {
      model: modelName,
      messages: requestData.messages || [],
      temperature: requestData.temperature || 0.2,
      max_tokens: requestData.max_tokens || 2048
    };
    
    console.log('Forwarding request to OpenRouter:', JSON.stringify(openRouterRequest, null, 2));
    
    // Create a controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      // Make the request to OpenRouter
      const response = await fetch(OPENROUTER_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://ai-fitness-app.vercel.app',
          'X-Title': 'AI Fitness App'
        },
        body: JSON.stringify(openRouterRequest),
        signal: controller.signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error:', response.status, errorData);
        return NextResponse.json(
          { error: `API responded with status ${response.status}`, details: errorData },
          { status: response.status }
        );
      }
      
      // Return the response from OpenRouter
      const data = await response.json();
      console.log('✅ OpenRouter response received successfully');
      console.log('Response structure:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        hasContent: !!data.choices?.[0]?.message?.content
      });
      
      // Ensure we have valid content
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('❌ Invalid response structure from OpenRouter:', data);
        return NextResponse.json(
          { error: 'Invalid response structure', details: data },
          { status: 500 }
        );
      }
      
      return NextResponse.json(data);
      
    } catch (fetchError) {
      // Clear the timeout
      clearTimeout(timeoutId);
      
      console.error('Error when connecting to OpenRouter:', fetchError);
      
      // Check if it was a timeout
      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
      
      return NextResponse.json(
        { 
          error: isTimeout ? 'Request timeout' : 'Network connection error', 
          message: isTimeout 
            ? 'Request to OpenRouter API timed out. Using fallback responses.'
            : 'Failed to connect to OpenRouter API. Using fallback responses.',
          networkError: true
        },
        { status: isTimeout ? 504 : 503 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : String(error),
        networkError: true
      },
      { status: 500 }
    );
  }
}
