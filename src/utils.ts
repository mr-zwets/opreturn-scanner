import { ChaingraphClient, graphql } from "chaingraph-ts"

const chaingraphUrl = "https://gql.chaingraph.pat.mn/v1/graphql"

const chaingraphClient = new ChaingraphClient(chaingraphUrl)

export async function fetchOpreturnMarkers(markerUtftf8Hex:string){
  const queryReqOpreturnMarker = graphql(`query opreturnMarker (
    $marker: String
  ){
    output(
      where: {
        locking_bytecode_pattern: {
          _eq: $marker
        }
      }
    ) {
      transaction_hash
    }
  }`);
  
  const variables = {
    marker: markerUtftf8Hex
  }

  console.log(markerUtftf8Hex)
  
  // 5. Use your custom query through the 'chaingraphClient'
  const resultQueryOpreturnMarker = await chaingraphClient.query(queryReqOpreturnMarker, variables)
  
  // 6. Check and output the result
  if (!resultQueryOpreturnMarker.data) {
    throw new Error("No data returned from Chaingraph query");
  }
  const listTxIds = resultQueryOpreturnMarker.data.output.map((output: any) => output.transaction_hash.slice(2));
  return listTxIds
}