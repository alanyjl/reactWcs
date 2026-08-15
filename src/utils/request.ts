export async function myFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status === 403) {
    // 拦截未授权跳转
    window.location.href = '/activate';
    throw new Error('授权失效');
  }

  return response;
}
