import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { absoluteUrl, site, sortByDate } from "../utils/site";

// llms.txt (https://llmstxt.org/) is a proposed, not standardized, index that points
// AI tools at a site's key pages. It is generated from the same collections as the
// sitemap so it never lists drafts or goes stale.
export const GET: APIRoute = async () => {
  const posts = sortByDate((await getCollection("blog")).filter((post) => !post.data.draft));
  const products = (await getCollection("products")).filter(
    (product) => !product.data.draft && !product.id.startsWith("_")
  );
  const projects = await getCollection("projects");

  const line = (title: string, path: string, description: string) =>
    `- [${title}](${absoluteUrl(path)}): ${description}`;

  const sections = [
    `# ${site.name}`,
    `> ${site.description}`,
    [
      "## About",
      line("About", "/about/", `Who ${site.author} is and how to get in touch.`),
      line("Now", "/now/", "What I'm working on at the moment.")
    ].join("\n"),
    posts.length > 0 &&
      ["## Writing", ...posts.map((post) => line(post.data.title, `/writing/${post.id}/`, post.data.description))].join(
        "\n"
      ),
    products.length > 0 &&
      [
        "## Products",
        ...products.map((product) => line(product.data.title, `/products/${product.id}/`, product.data.description))
      ].join("\n"),
    projects.length > 0 &&
      [
        "## Projects",
        ...projects.map((project) => line(project.data.title, `/projects/${project.id}/`, project.data.description))
      ].join("\n")
  ].filter(Boolean);

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
