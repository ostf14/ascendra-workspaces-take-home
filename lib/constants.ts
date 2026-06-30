// Mid of the mock backend's 8-15s transition window. Used by the lifecycle
// UI to render a countdown that matches what the user will actually wait.
// Cold provisioning (first start of a freshly-created workspace) tends to
// run longer; the "almost done" branch covers that case without faking a
// percent number.
export const EXPECTED_TRANSITION_SECONDS = 12;

// Step indicator wall-clock — divided into N stages so the labelled steps
// advance as evenly as possible across the expected duration.
export const STARTING_STEPS = [
  "Provisioning VM",
  "Pulling image",
  "Installing dependencies",
  "Starting services",
] as const;

export const STOPPING_STEPS = [
  "Stopping services",
  "Persisting state",
  "Shutting down VM",
] as const;
