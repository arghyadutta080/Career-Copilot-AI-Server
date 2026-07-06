const clients = new Map<string, any>();

export const addClient = (id: string, res: any) => {
  clients.set(id, res);
};

export const removeClient = (id: string) => {
  clients.delete(id);
};

export const sendEvent = (id: string, event: any) => {
  const client = clients.get(id);

  if (!client) return;

  client.write(`data: ${JSON.stringify(event)}\n\n`);
};

export const broadcast = (event: any) => {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(event)}\n\n`);
  });
};
