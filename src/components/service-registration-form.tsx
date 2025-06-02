
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
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
import { Terminal, Globe, ServerIcon, Gamepad2, Info, CheckCircle2, FileJson } from 'lucide-react';
import type { ServiceRegistrationApiPayload, RegisteredService } from '@/types';

const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.').max(200, 'Description must be at most 200 characters.'),
  local_url: z.string().url('Please enter a valid local URL (e.g., http://localhost:3000 or http://127.0.0.1:8080).'),
  domain: z.string().optional().refine(val => {
    if (!val || val.trim() === '') return true; // Optional field
    return /^[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(panda|pinou|pika|ninar|nation)$/.test(val);
  }, {
    message: "Invalid domain. Must be like 'myservice.panda' or 'app.myservice.pinou'. Allowed suffixes: .panda, .pinou, .pika, .ninar, .nation. Use alphanumeric characters and hyphens for name parts.",
  }).transform(val => val === "" ? undefined : val), // Treat empty string as undefined
  type: z.enum(['website', 'api', 'game', 'other'], { required_error: 'Please select a service type.' }),
  customType: z.string().optional(),
  publicUrl: z.string().url('Please enter a valid public URL (e.g., from ngrok, playit.gg).'),
}).superRefine((data, ctx) => {
  if (data.type === 'other' && (!data.customType || data.customType.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Custom type must be at least 2 characters long when "Other" is selected.',
      path: ['customType'],
    });
  }
  if (data.type !== 'other' && data.customType && data.customType.trim() !== '') {
     // Clear customType if another type is selected and customType has a value
    // This is handled by form logic to reset the field, schema doesn't need to error
  }
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceRegistrationFormProps {
  onSuccess?: (data: RegisteredService) => void;
}

export function ServiceRegistrationForm({ onSuccess }: ServiceRegistrationFormProps) {
  const [registeredServiceInfo, setRegisteredServiceInfo] = useState<RegisteredService | null>(null);
  const { toast } = useToast();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      local_url: '',
      domain: '',
      type: undefined,
      customType: '',
      publicUrl: '',
    },
  });

  const watchedServiceType = form.watch('type');
  const watchedLocalUrl = form.watch('local_url');

  useEffect(() => {
    if (watchedServiceType !== 'other') {
      form.setValue('customType', ''); // Clear customType if not 'other'
    }
  }, [watchedServiceType, form]);
  
  let isValidLocalUrl = false;
  try {
    if (watchedLocalUrl) new URL(watchedLocalUrl);
    isValidLocalUrl = true;
  } catch (e) {
    isValidLocalUrl = false;
  }


  const onSubmit: SubmitHandler<ServiceFormValues> = async (data) => {
    const token = uuidv4();
    const finalServiceType = data.type === 'other' ? data.customType! : data.type;

    const apiPayload: ServiceRegistrationApiPayload = {
      name: data.name,
      description: data.description,
      local_url: data.local_url,
      public_url: data.publicUrl, // Map from form's publicUrl to API's public_url
      domain: data.domain || undefined, // Ensure domain is undefined if empty string from form
      type: finalServiceType,
      token: token,
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
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
      form.reset({ // Reset with potentially new defaults if needed
        name: '',
        description: '',
        local_url: '',
        domain: '',
        type: undefined,
        customType: '',
        publicUrl: '',
      });
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
          Enter your service details to generate a public tunnel and register it with PANDA.
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
                name="local_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local URL</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="e.g., http://localhost:3000" {...field} />
                    </FormControl>
                     {watchedLocalUrl && isValidLocalUrl && (
                       <FormDescription className="flex items-center mt-2">
                         <Info className="w-4 h-4 mr-1 text-muted-foreground" /> Local access: <a href={watchedLocalUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">{watchedLocalUrl}</a>
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                        <SelectItem value="other">
                          <span className="flex items-center"><FileJson className="mr-2 h-4 w-4" /> Other...</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {watchedServiceType === 'other' && (
              <FormField
                control={form.control}
                name="customType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Service Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Database, Bot, Custom Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom PANDA Domain (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., myapp.panda" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Your unique address on the PANDA network. Allowed suffixes: .panda, .pinou, .pika, .ninar, .nation.
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
                    The public URL provided by your tunneling service (e.g., ngrok, Cloudflare Tunnel, playit.gg).
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
              <p><strong>Type:</strong> {registeredServiceInfo.type}</p>
              <p><strong>Token:</strong> <code className="bg-muted px-1 py-0.5 rounded text-sm">{registeredServiceInfo.token}</code></p>
              <p><strong>Local URL:</strong> <a href={registeredServiceInfo.local_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{registeredServiceInfo.local_url}</a></p>
              <p><strong>Public URL:</strong> <a href={registeredServiceInfo.public_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{registeredServiceInfo.public_url}</a></p>
              {registeredServiceInfo.domain && <p><strong>PANDA Domain:</strong> {registeredServiceInfo.domain}</p>}
              <p><strong>Registered At:</strong> {new Date(registeredServiceInfo.createdAt).toLocaleString()}</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
