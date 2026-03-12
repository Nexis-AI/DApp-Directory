export interface MpcToolDoc {
  name: string
  description: string
  parameters: string[]
  sampleQuery: string
}

export interface MpcResourceDoc {
  uri: string
  description: string
}

export const MCP_SERVER = {
  name: "nexis-dapps-directory",
  version: "0.1.0",
  instructions:
    "Read-only catalog of Web3, NFT, and dApp projects with chain and category filters.",
}

export const MCP_CAPABILITIES = [
  "Semantic dApp search by free text, chain, and category.",
  "Stable lookup by catalog id or slug.",
  "Chain and category aggregate summaries for agent planning.",
  "Resource access to the full index and scoped dApp records.",
]

export const MCP_TOOLS: MpcToolDoc[] = [
  {
    name: "dapps_search",
    description: "Search the dApp catalog by free text, chain, or category.",
    parameters: ["q?: string", "chain?: string", "category?: string", "limit?: number"],
    sampleQuery: `{
  "q": "lending",
  "chain": "Base",
  "category": "DeFi",
  "limit": 5
}`,
  },
  {
    name: "dapps_get",
    description: "Get a single dApp by stable id or slug.",
    parameters: ["id: string"],
    sampleQuery: `{
  "id": "uniswap"
}`,
  },
  {
    name: "dapps_list_chains",
    description: "List supported chains and dApp counts.",
    parameters: [],
    sampleQuery: "{}",
  },
  {
    name: "dapps_list_categories",
    description: "List supported categories and dApp counts.",
    parameters: [],
    sampleQuery: "{}",
  },
]

export const MCP_RESOURCES: MpcResourceDoc[] = [
  {
    uri: "catalog://dapps/index",
    description: "Full dApp directory catalog.",
  },
  {
    uri: "catalog://dapps/chains",
    description: "Chain counts derived from the directory.",
  },
  {
    uri: "catalog://dapps/categories",
    description: "Category counts derived from the directory.",
  },
  {
    uri: "catalog://dapps/{id}",
    description: "Resource template for a single dApp by id or slug.",
  },
]
