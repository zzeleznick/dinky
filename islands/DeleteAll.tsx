interface DeleteAllProps {
  targetUrl: string;
  dryRun: boolean;
}

export default function DeleteAll(props: DeleteAllProps) {
  const { targetUrl } = props;

  const sendDeletionRequest = async (endpoint: string) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '',
    });
    if(!response) {
      console.error(`Empty response for url: ${endpoint}!`)
      return
    }
    if (!response.ok) {
      console.warn(`Unhealthy response for url: ${endpoint}!`)
    }
    const data = await Promise.resolve(response.clone().json().catch(() => response.text()));
    console.log(`data: ${JSON.stringify(data)}`);
  }

  return (
    <div class="flex gap-2 w-full py-6">
      <button class="px-2 py-1 border(gray-100 2) hover:bg-red-400"
       onClick={() => sendDeletionRequest(targetUrl)}>Delete All</button>
    </div>
  );
}
