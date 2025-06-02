
// Represents the raw data from the form, including customType if 'other' is selected
export interface ServiceFormInputValues {
  name: string;
  description: string;
  local_url: string; // Changed from port
  domain?: string;
  type: 'website' | 'api' | 'game' | 'other';
  customType?: string; // For 'other' type
  publicUrl: string; // Field from form, will be mapped to public_url for API
}

// Represents the data structure sent to the /api/register endpoint
export interface ServiceRegistrationApiPayload {
  name: string;
  description: string;
  local_url: string; // As per API doc
  domain?: string;
  type: string; // Actual type string (e.g. 'website' or custom value)
  public_url: string; // As per API doc
  token: string;
}

// Represents the service data as returned by the API and used for display
export interface RegisteredService {
  id: string;
  name: string;
  description: string;
  local_url: string; // As per API doc
  public_url: string; // As per API doc
  domain?: string;
  type: string;
  token: string;
  createdAt: string;
}
