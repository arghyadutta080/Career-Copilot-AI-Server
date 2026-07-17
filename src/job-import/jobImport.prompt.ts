export function buildJobImportPrompt(cleanedHtml: string, url: string) {
  return `
You are an expert recruitment assistant tasked with extracting structured job information from a webpage.
Extract the Job Title, Company Name, and the complete Job Description.

Please ignore all navigation bars, headers, footers, cookie banners, advertisements, legal notices, and unrelated page content. Focus solely on the actual job posting details.

The extracted information must match the requested schema perfectly.
If you cannot find the company name, use "Unknown Company".
If you cannot find the job title, use "Unknown Title".

Here is the cleaned content from the job posting webpage:
${cleanedHtml}

Url for sourceUrl: ${url}
`;
}
