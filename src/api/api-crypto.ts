export const domainUrl = `https://www.cryptocompare.com`;
const baseURL = `https://min-api.cryptocompare.com/data`;

const API_KEY =
  'dab9caf7738c45a3ea0f8d0bef5568fba1711252d7a3107b32c885f3b1f28f39';
export async function getSingleSymbolPrice({
  symbol,
  currency = 'USD',
}: {
  symbol: string;
  currency?: string;
}) {
  const URI = `${baseURL}/price?fsym=${symbol}&tsyms=${currency}&api_key=${API_KEY}&gt`;
  try {
    const response = await fetch(URI);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    if (data.Response === 'Error') {
      console.log('ERROR: ', data);
      return;
    }

    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function getCoinsData() {
  const URI = `${baseURL}/all/coinlist`;
  try {
    const response = await fetch(URI);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    if (data.Response === 'Error') {
      console.log('ERROR: ', data);
      return;
    }
    const coinsData = getCoinsMainInfo(data);
    return coinsData;
  } catch (err) {
    console.log(err);
  }
}

//helpers
function getCoinsMainInfo({
  Data,
}: {
  Data: {
    [symbol: string]: { Id: string; CoinName: string; ImageUrl: string };
  };
}) {
  const coinsInfo = [];
  for (let symbol in Data) {
    const coin = {
      id: Data[symbol].Id,
      symbol: symbol,
      name: Data[symbol].CoinName,
      imagePath: Data[symbol].ImageUrl,
    };
    coinsInfo.push(coin);
  }
  return coinsInfo;
}