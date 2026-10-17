const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export async function createArticle(
  data: { title: string; content: string; status: "draft" | "published"; tags: string[] },
  token: string
) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("status", data.status);
  formData.append("tags", JSON.stringify(data.tags));

  const response = await fetch(`${API_BASE}/api/articles/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create article");
  }

  return response.json();
}

export async function updateArticle(
  id: string,
  data: { title: string; content: string; status: "draft" | "published"; tags: string[] },
  token: string
) {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.content) formData.append("content", data.content);
  if (data.status) formData.append("status", data.status);
  if (data.tags) formData.append("tags", JSON.stringify(data.tags));

  const response = await fetch(`${API_BASE}/api/articles/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update article");
  }

  return response.json();
}

export async function getAuthorArticles(params: { status: "published" | "draft"; page?: number; authorId: string }, token: string) {
  const url = new URL(`${API_BASE}/api/articles`);
  url.searchParams.set("status", params.status);
  url.searchParams.set("author", params.authorId);
  if (params.page) {
    url.searchParams.set("page", params.page.toString());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch author articles");
  }

  const result = await response.json();
  
  // map the result to match the frontend expectations
  return {
    items: result.data.map((item: any) => ({
      ...item,
      id: item._id,
      excerpt: item.content ? item.content.replace(/<[^>]+>/g, '').substring(0, 150) + "..." : "",
      date: item.createdAt,
    })),
    totalPages: result.pagination?.totalPages || 1,
  };
}

export async function fetchPublicArticles(params: { page?: number; limit?: number }) {
  const url = new URL(`${API_BASE}/api/articles`);
  url.searchParams.set("status", "published");
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }

  const result = await response.json();
  return {
    items: result.data.map((item: any) => ({
      ...item,
      id: item._id,
      excerpt: item.content ? item.content.replace(/<[^>]+>/g, '').substring(0, 150) + "..." : "",
      date: item.createdAt,
    })),
    totalPages: result.pagination?.totalPages || 1,
  };
}

export async function fetchArticleById(id: string) {
  const response = await fetch(`${API_BASE}/api/articles/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }
  return response.json();
}
