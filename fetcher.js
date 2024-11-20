import 'dotenv/config';

export const fetcher = async ({ query, variables }) => {

    return fetch(process.env.VITE_TALLY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.VITE_TALLY_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json?.errors) {
          console.error("error when fetching");
          console.error(json.errors);
          return null;
        }
  
        return json.data;
      })
      .catch((error) => {
        console.log("Error when fetching =>", error);
  
        return error;
      });
  };