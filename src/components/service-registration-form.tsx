"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Globe, ServerIcon, Gamepad2, Info, CheckCircle2 } from 'lucide-react';
import type { ServiceMetadata, RegisteredService } from '@/types';

const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.').max(200, 'Description must be at most 200 characters.'),
  port: z.coerce.number().min(1, 'Port number must be positive.').max(65535, 'Port number must be less than 65536.'),
  domain: z.string().optional().refine(val => !val || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
    message: "Invalid domain format (e.g., myapp.panda.gg or sub.domain.com)",
  }),
  type: z.enum(['website', 'api', 'game'], { required_error: 'Please select a service type.' }),
  publicUrl: z.string().url('Please enter a valid public URL (e.g., from ngrok).'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceRegistrationFormProps {
  onSuccess?: (data: RegisteredService) => void;
}

export function ServiceRegistrationForm({ onSuccess }: ServiceRegistrationFormProps) {
  const [localUrl, setLocalUrl] = useState<string>('http://localhost:');
  const [registeredServiceInfo, setRegisteredServiceInfo] = useState<RegisteredService | null>(null);
  const { toast } = useToast();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      port: 3000,
      domain: '',
      type: undefined,
      publicUrl: '',
    },
  });

  const portValue = form.watch('port');

  useEffect(() => {
    if (portValue) {
      setLocalUrl(`http://localhost:${portValue}`);
    } else {
      setLocalUrl('http://localhost:');
    }
  }, [portValue]);

  const onSubmit: SubmitHandler<ServiceFormValues> = async (data) => {
    const token = crypto.randomUUID();
    const serviceDataWithToken: ServiceMetadata & { token: string } = { ...data, token };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceDataWithToken),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to register service.');
      }

      const result: RegisteredService = await response.json();
      toast({
        title: 'Success!',
        description: 'Service registered successfully.',
        variant: 'default',
      });
      setRegisteredServiceInfo(result);
      if (onSuccess) {
        onSuccess(result);
      }
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setRegisteredServiceInfo(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center text-3xl font-headline">
          <Terminal className="mr-3 h-8 w-8 text-primary" />
          PANDA Service Registration
        </CardTitle>
        <CardDescription>
          Enter your service details to generate a public tunnel and register it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome App" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief description of your service." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Port</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3000" {...field} />
                    </FormControl>
                    {localUrl !== 'http://localhost:' && (
                       <FormDescription className="flex items-center mt-2">
                         <Info className="w-4 h-4 mr-1 text-muted-foreground" /> Local access: <a href={localUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">{localUrl}</a>
                       </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="website">
                          <span className="flex items-center"><Globe className="mr-2 h-4 w-4" /> Website</span>
                        </SelectItem>
                        <SelectItem value="api">
                          <span className="flex items-center"><ServerIcon className="mr-2 h-4 w-4" /> API</span>
                        </SelectItem>
                        <SelectItem value="game">
                          <span className="flex items-center"><Gamepad2 className="mr-2 h-4 w-4" /> Game</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Domain (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., myapp.panda.gg" {...field} />
                  </FormControl>
                  <FormDescription>
                    If you have a custom domain for your tunnel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publicUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Tunnel URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-tunnel-id.ngrok.io" {...field} />
                  </FormControl>
                  <FormDescription>
                    The public URL provided by your tunneling service (e.g., ngrok, playit.gg).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Registering...' : 'Register Service'}
            </Button>
          </form>
        </Form>

        {registeredServiceInfo && (
          <Alert className="mt-8 bg-primary/10 border-primary/30">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">Service Registered Successfully!</AlertTitle>
            <AlertDescription className="mt-2 space-y-1 text-foreground/80">
              <p><strong>Name:</strong> {registeredServiceInfo.name}</p>
              <p><strong>Token:</strong> <code className="bg-muted px-1 py-0.5 rounded text-sm">{registeredServiceInfo.token}</code></p>
              <p><strong>Public URL:</strong> <a href={registeredServiceInfo.publicUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{registeredServiceInfo.publicUrl}</a></p>
              {registeredServiceInfo.domain && <p><strong>Custom Domain:</strong> {registeredServiceInfo.domain}</p>}
              <p><strong>Registered At:</strong> {new Date(registeredServiceInfo.createdAt).toLocaleString()}</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
