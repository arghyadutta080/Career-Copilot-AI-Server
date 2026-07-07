import mammoth from "mammoth";

export async function parseDOCX(buffer: Buffer) {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value;
}
