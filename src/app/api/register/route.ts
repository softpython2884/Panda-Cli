
import { NextResponse, type NextRequest } from 'next/server';
import type { ServiceRegistrationApiPayload, RegisteredService } from '@/types';

// In a real application, this would interact with a database or an external service.
// For this example, we'll just simulate it.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ServiceRegistrationApiPayload;

    // Basic validation (more robust validation should be done)
    if (!body.name || !body.local_url || !body.type || !body.public_url || !body.token) {
      return NextResponse.json({ message: 'Missing required fields (name, local_url, type, public_url, token).' }, { status: 400 });
    }

    const registeredService: RegisteredService = {
      id: crypto.randomUUID(), // Generate a unique ID for this registration
      name: body.name,
      description: body.description,
      local_url: body.local_url,
      public_url: body.public_url,
      domain: body.domain,
      type: body.type,
      token: body.token,
      createdAt: new Date().toISOString(),
    };

    // Simulate saving to a "Pod" or external service
    console.log('Service registration request received:');
    console.log(JSON.stringify(registeredService, null, 2));
    console.log(`Simulating call to external Pod at /register with token: ${registeredService.token}`);

    // Simulate successful registration
    return NextResponse.json(registeredService, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON payload.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Failed to register service.', error: errorMessage }, { status: 500 });
  }
}
