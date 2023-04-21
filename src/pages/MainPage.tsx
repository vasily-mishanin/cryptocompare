import { Component, ReactNode } from 'react';
import { Header } from '../components/Header/Header';
import { SearchBar } from '../components/SearchBar/SearchBar';
import classes from './MainPage.module.scss';
import {
  domainUrl,
  getCoinsData,
  getSingleSymbolPrice,
} from '../api/api-crypto';
import { SearchResultItem } from '../components/SearchResultItem/SearchResultItem';
import { CoinDynamicData, CoinStaticData, Coin } from './types';
import { Action } from '../components/ui/Button/types';
import {
  addToLocalStorage,
  getFromLocalStorage,
} from '../api/api-local-storage';
import { CoinsList } from '../components/CoinsList/CoinsList';
import { Loading } from '../components/ui/Loading/Loading';

interface PriceResponseBody {
  [currency: string]: number;
}

type MainPageProps = {};
type MainPageState = {
  currentSearchResult: CoinDynamicData | null;
  currentCoin: Coin | null;
  userCoinsList: Coin[];
  coinsStaticData: CoinStaticData[];
  loading: { isLoading: boolean; message: string };
};

export class MainPage extends Component<MainPageProps, MainPageState> {
  state: MainPageState = {
    currentSearchResult: null,
    currentCoin: null,
    userCoinsList: [],
    coinsStaticData: [],
    loading: { isLoading: false, message: '' },
  };

  async componentDidMount(): Promise<void> {
    let coins = getFromLocalStorage('coinsStaticData');

    if (!coins) {
      this.setState({
        loading: { isLoading: true, message: 'Getting crypto static data...' },
      });
      coins = await getCoinsData();
      this.setState({ loading: { isLoading: false, message: '' } });
    }

    if (coins) {
      addToLocalStorage('coinsStaticData', coins);
      this.setState({ coinsStaticData: coins });
    }
  }

  getCurrentCoinStaticData = () => {
    const coin = this.state.coinsStaticData.find(
      (coin) => coin.symbol === this.state.currentSearchResult?.symbol
    );

    if (!coin) {
      return null;
    }

    const { id, symbol, name, imagePath } = coin;
    const currentCoin: CoinStaticData = {
      id,
      name,
      symbol,
      imagePath: `${domainUrl}${imagePath}`,
    };
    return currentCoin;
  };

  handleSearch = async (inputValue: string) => {
    this.setState({
      loading: { isLoading: true, message: 'Loading price...' },
    });
    let priceData = (await getSingleSymbolPrice({
      symbol: inputValue,
    })) as PriceResponseBody;
    this.setState({ loading: { isLoading: false, message: '' } });

    if (!priceData) {
      return;
    }

    const coinPrice = Object.entries(priceData).at(0); // {USD: 28770.34} => ['USD', 28770.34]

    if (!coinPrice) {
      return;
    }

    const newResult: CoinDynamicData = {
      symbol: inputValue.toUpperCase(),
      currency: coinPrice[0],
      price: coinPrice[1],
    };

    this.setState(
      (prev) => ({
        ...prev,
        currentSearchResult: newResult,
      }),
      () => {
        const currentCoinStaticData = this.getCurrentCoinStaticData(); // uses this.state

        if (!currentCoinStaticData || !this.state.currentSearchResult) {
          return;
        }

        const currentCoin = {
          ...this.state.currentSearchResult,
          ...currentCoinStaticData,
        };

        this.setState((prev) => ({ ...prev, currentCoin: currentCoin }));
      }
    );
  };

  handleAddCoinToMyList = (action: Action, id: string) => {
    if (action !== Action.ADD) {
      return;
    }

    this.setState((prev) => {
      const existingCoinInTheList = prev.userCoinsList.find(
        (coin) => coin.id === id
      );
      if (this.state.currentCoin && !existingCoinInTheList) {
        return {
          ...prev,
          userCoinsList: [...prev.userCoinsList, this.state.currentCoin],
        };
      }
      return prev;
    });
  };

  render(): ReactNode {
    const { currentCoin, userCoinsList, loading } = this.state;
    const isCurrentCoinLicted = userCoinsList.find(
      (coin) => coin.id === currentCoin?.id
    );

    return (
      <div className={classes.app}>
        <Header />
        <SearchBar
          placeholder='e.g. ETH or Ethereum'
          onSearch={this.handleSearch}
        />
        {currentCoin && (
          <SearchResultItem
            currentCoin={currentCoin}
            onAdd={this.handleAddCoinToMyList}
            isListed={!!isCurrentCoinLicted}
          />
        )}

        {!currentCoin && (
          <Loading isLoading={loading.isLoading} message={loading.message} />
        )}

        <CoinsList />
      </div>
    );
  }
}
