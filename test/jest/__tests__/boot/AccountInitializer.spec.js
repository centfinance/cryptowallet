import AccountInitializer from '@/boot/AccountInitializer/';
import { shallowMount } from '@vue/test-utils';
import { localVue, i18n } from '@/helpers/SetupLocalVue';
import { createMocks as createStoreMocks } from '@/store/__mocks__/store.js';
import Account from '@/store/wallet/entities/account';
import Wallet from '@/store/wallet/entities/wallet';
import Coins from '@/store/settings/state/supportedCoins.js';
import { mockBitcoinSDK, mockEthereumSDK, mockERC20SDK } from '~/__mocks__/cryptowallet-js';

let wrapperMock;
let mockAccount;
const { store } = createStoreMocks();

const bitcoinSDKs = [];
const ethereumSDKs = [];
const ERC20SDKs = [];

Coins.forEach((coin) => {
  if (coin.sdk === 'Bitcoin') {
    bitcoinSDKs.push(coin);
  }

  if (coin.sdk === 'Ethereum') {
    ethereumSDKs.push(coin);
  }

  if (coin.sdk === 'ERC20') {
    ERC20SDKs.push(coin);
  }
});

const mockData = {
  pinArray: [0, 0, 0, 0, 0, 0],
  accountName: 'Sim',
  salt: '$2a$10$KE86k38NXlqTBgOQUC9bF.',
  accountLocale: 'en-gb',
  accountCurrency: 'GBP',
  seed: {
    real: 'real', debate: 'debate', another: 'another', phone: 'phone', response: 'response', toddler: 'toddler', fee: 'fee', offer: 'offer', bundle: 'bundle', crack: 'crack', monster: 'monster', earth: 'earth',
  },
};

describe('boot/AccountInitializer', () => {
  beforeEach(async () => {
    wrapperMock = shallowMount({ name: 'mock', template: '<div/>' }, { i18n, localVue, store });
  });


  it('exports a function', async () => {
    expect(typeof AccountInitializer).toBe('function');
  });

  it('can create an account and add it to the database', async () => {
    Account.$insert = jest.fn(() => { return { account: [{ uid: 1 }] }; });
    mockAccount = await wrapperMock.vm.accountInitializer.createAccount(mockData);
    expect(mockAccount).toEqual({ uid: 1 });
  });

  it('uses the currency setting from the first account if no currency was set', async () => {
    Account.all = jest.fn(() => {
      return [{
        uid: 2,
        currency: 'USD',
      }];
    });
    Account.$insert = jest.fn(({ data, password }) => {
      return { account: [{ data, password }] };
    });
    mockData.accountCurrency = undefined;
    mockAccount = await wrapperMock.vm.accountInitializer.createAccount(mockData);
    expect(mockAccount.data.currency).toEqual('USD');
  });

  it('uses the language setting from the first account if no language was set', async () => {
    Account.all = jest.fn(() => {
      return [{
        uid: 2,
        locale: 'en-US',
      }];
    });
    Account.$insert = jest.fn(({ data, password }) => {
      return { account: [{ data, password }] };
    });
    mockData.accountLocale = undefined;
    mockAccount = await wrapperMock.vm.accountInitializer.createAccount(mockData);
    expect(mockAccount.data.locale).toEqual('en-US');
  });

  it('encrypts the pin', async () => {
    Account.$insert = jest.fn(({ data, password }) => {
      return { account: [{ data, password }] };
    });
    mockAccount = await wrapperMock.vm.accountInitializer.createAccount(mockData);
    expect(mockAccount.data.pinHash).toEqual('$2a$10$KE86k38NXlqTBgOQUC9bF.INRIuD7/tsomm9oeKr7GROQldIBq/xu');
  });

  it('can create wallets and add them to the database', async () => {
    Wallet.$insert = jest.fn(({ data, password }) => {
      return { wallet: [{ data, password }] };
    });
    await wrapperMock.vm.accountInitializer.createWallets(mockData, 1, Coins);// need to test for Celo
    expect(Wallet.$insert).toHaveBeenCalledTimes(bitcoinSDKs.length + ethereumSDKs.length);
    expect(mockBitcoinSDK.generateHDWallet).toHaveBeenCalledTimes(bitcoinSDKs.length);
    expect(mockEthereumSDK.generateHDWallet).toHaveBeenCalledTimes(ethereumSDKs.length);
  });

  it('can create erc20 wallets and add them to the database', async () => {
    Wallet.$insert = jest.fn(({ data }) => { return { wallet: [{ data }] }; });
    await wrapperMock.vm.accountInitializer.createERC20Wallets(mockData, 1, Coins);
    expect(Wallet.$insert).toHaveBeenCalledTimes(ERC20SDKs.length);
    expect(mockERC20SDK.generateERC20Wallet).toHaveBeenCalledTimes(ERC20SDKs.length);
  });
});
