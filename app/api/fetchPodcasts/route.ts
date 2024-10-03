// app/api/fetchPodcasts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GraphQLClient, gql } from "graphql-request";

const SEARCH_FOR_TERM_QUERY = gql`
  query searchForTerm($term: String, $page: Int, $limitPerPage: Int, $filterForTypes: [TaddyType], $filterForCountries: [Country], $filterForLanguages: [Language], $filterForGenres: [Genre], $filterForSeriesUuids: [ID], $filterForNotInSeriesUuids: [ID], $isExactPhraseSearchMode: Boolean, $isSafeMode: Boolean, $searchResultsBoostType: SearchResultBoostType) {
    searchForTerm(term: $term, page: $page, limitPerPage: $limitPerPage, filterForTypes: $filterForTypes, filterForCountries: $filterForCountries, filterForLanguages: $filterForLanguages, filterForGenres: $filterForGenres, filterForSeriesUuids: $filterForSeriesUuids, filterForNotInSeriesUuids: $filterForNotInSeriesUuids, isExactPhraseSearchMode: $isExactPhraseSearchMode, isSafeMode: $isSafeMode, searchResultsBoostType:$searchResultsBoostType) {
      searchId
      podcastSeries {
        uuid
        name
        rssUrl
        itunesId
      }
      podcastEpisodes {
        uuid
        guid
        name
        audioUrl
      }
    }
  }
`;

async function taddyGraphqlRequest({ query, variables }) {
  const endpointUrl = "https://api.taddy.org/";
    
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Example App',
    'X-USER-ID': process.env.TADDY_USER_ID,
    'X-API-KEY': process.env.TADDY_API_KEY,
  }
  
  try {
    const client = new GraphQLClient(endpointUrl, { headers });
    const data = await client.request(query, variables);
    return data;
  } catch (e) {
    console.log("inside taddyGraphqlRequest", e);
    throw new Error("Failed to fetch data from Taddy API");
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limitPerPage = parseInt(searchParams.get("limitPerPage") || "25");

  const variables = { term, page, limitPerPage };

  try {
    console.log("fetching podcasts", variables);
    const data = await taddyGraphqlRequest({ query: SEARCH_FOR_TERM_QUERY, variables });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch podcasts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
