export async function addPlugin(token, plugin_id) {
  const response = await fetch(`api/plugins/${plugin_id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error('Failed to add plugin'); // 將失敗情況拋出
  }
  return data;
}

export async function postPlugin(token, formData) {
  const response = await fetch('api/system/plugins', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();
  if (data.success !== true) {
    throw new Error(data.message);
  }
  return data;
}

export async function removePlugin(token, plugin_id) {
  const response = await fetch(`api/plugins/${plugin_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error('Failed to remove plugin'); // 將失敗情況拋出
  }

  return data;
}

export async function fetchPlugins(token) {
  const response = await fetch('api/plugins', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return data;
}

export async function fetchUserPlugins(token) {
  const response = await fetch('api/system/plugins', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return data;
}
