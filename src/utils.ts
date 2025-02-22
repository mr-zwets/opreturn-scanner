import { ChaingraphClient, graphql } from "chaingraph-ts"

const chaingraphUrl = "https://gql.chaingraph.pat.mn/v1/graphql"

const chaingraphClient = new ChaingraphClient(chaingraphUrl)

export async function fetchOpreturnMarkers(opreturnMarker:string){
  const queryReqOpreturnMarker = graphql(`query opreturnMarker (
    $opreturnMarker: String
  ){
    search_output_prefix(
      args: { locking_bytecode_prefix_hex: $opreturnMarker }
      where: {
        transaction: {
          block_inclusions: {
            block: { accepted_by: { node: { name: { _regex: "mainnet" } } } }
          }
        }
      }
    ) {
      transaction_hash
    }
  }`);
  
  // TODO: add timeout to requests
  const resultQueryOpreturnMarker = await chaingraphClient.query(queryReqOpreturnMarker, {opreturnMarker})
  
  if (!resultQueryOpreturnMarker.data) {
    throw new Error("No data returned from Chaingraph query");
  }
  console.log(resultQueryOpreturnMarker)
  const listTxIds = resultQueryOpreturnMarker.data.search_output_prefix.map((output: any) => output.transaction_hash.slice(2));
  return listTxIds
}