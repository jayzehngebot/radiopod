import { NextRequest, NextResponse } from "next/server";
import { GraphQLClient, gql } from "graphql-request";
import { createClient } from 'redis';
// import clientPromise from "../../../../lib/mongodb";   

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

async function initializeRedisClient() {
    await redisClient.connect();
}

initializeRedisClient();

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

// Define a type for the variables if you know their structure
type VariablesType = {
  term: string;
  page: number; // Add this line to include 'page'
  limitPerPage: number;
};

async function taddyGraphqlRequest({ query, variables }: { query: string; variables: VariablesType }) {
  const endpointUrl = "https://api.taddy.org/";
    
  console.log('userid : ', process.env.TADDY_USER_ID);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Example App',
    'X-USER-ID': process.env.TADDY_USER_ID || '',
    'X-API-KEY': process.env.TADDY_API_KEY || '', 
  }
  
  try {
    const client = new GraphQLClient(endpointUrl, { headers });
    console.log('endpointUrl', endpointUrl);
    console.log('query', query);
    console.log('variables', variables);
    const data = await client.request(query, variables);
    return data;
  } catch (e) {
    console.log("inside taddyGraphqlRequest", e);
    throw new Error("Failed to fetch data from Taddy API");
  }
}

export async function GET(request: NextRequest) {
  console.log('request', request);
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term") || "";
  
  const page = parseInt(searchParams.get("page") || "1");
  const limitPerPage = parseInt(searchParams.get("limitPerPage") || "25");

  const variables: VariablesType = {
    term: term,
    page: page,
    limitPerPage: limitPerPage,
  };

  const cacheKey = `podcasts:${term}:${page}:${limitPerPage}`;
  console.log('cacheKey', cacheKey);
  
  try {
    // Check if the data is in the cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Returning cached data");
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log("fetching podcasts", variables);
    const data = await taddyGraphqlRequest({ query: SEARCH_FOR_TERM_QUERY, variables });

    // Cache the data for 2 hours
    // await redisClient.set(cacheKey, JSON.stringify(data), {
    //   EX: 7200, // 2 hours in seconds
    // });
    console.log('data', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch podcasts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
