export const fetchLinksFromAPI = async () => {
  const endpoint = `${window.location.origin}/api/links`;
  let resp;
  try {
    resp = await fetch(endpoint);
  } catch (e) {
    console.error(`Failed to fetch: ${e}`);
    return;
  }
  if (!resp.ok) {
    console.error(`Failed to fetch: status: ${resp.status}`);
    return;
  }
  const data = await resp.json();
  return data?.links;
};
