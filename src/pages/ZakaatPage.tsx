import { type FormEvent, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WealthData {
  cash: number;
  savingsAccount: number;
  goldOunces: number;
  silverOunces: number;
  stocks: number;
  cryptocurrency: number;
  otherAssets: number;
}

interface ZakaatResult {
  totalWealth: number;
  nisabThreshold: number;
  isEligible: boolean;
  zakaatAmount: number;
  breakdown: {
    goldValue: number;
    silverValue: number;
    liquidAssets: number;
    investments: number;
  };
}

const ZakaatPage = () => {
  const [wealth, setWealth] = useState<WealthData>({
    cash: 0,
    savingsAccount: 0,
    goldOunces: 0,
    silverOunces: 0,
    stocks: 0,
    cryptocurrency: 0,
    otherAssets: 0,
  });

  const [result, setResult] = useState<ZakaatResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR' | 'EUR'>('INR');
  const [goldPriceUsd, setGoldPriceUsd] = useState<number | null>(null);
  const [silverPriceUsd, setSilverPriceUsd] = useState<number | null>(null);
  const [usdToInrRate, setUsdToInrRate] = useState<number | null>(null);
  const [usdToEurRate, setUsdToEurRate] = useState<number | null>(null);
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string>('');
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Fallbacks in case live endpoints fail
  const FALLBACK_GOLD_PRICE_USD = 2000; // USD per troy ounce
  const FALLBACK_SILVER_PRICE_USD = 25; // USD per troy ounce
  const FALLBACK_USD_TO_INR = 83.5;
  const FALLBACK_USD_TO_EUR = 0.92;
  const TROY_OUNCE_TO_GRAMS = 31.1034768;

  const NISAB_GOLD_OUNCES = 2.5; // Nisab threshold in gold (troy ounces)
  const NISAB_SILVER_OUNCES = 52.5; // Nisab threshold in silver (troy ounces)
  const NISAB_GOLD_GRAMS = NISAB_GOLD_OUNCES * TROY_OUNCE_TO_GRAMS;
  const NISAB_SILVER_GRAMS = NISAB_SILVER_OUNCES * TROY_OUNCE_TO_GRAMS;
  const ZAKAAT_RATE = 0.025; // 2.5%

  const effectiveGoldUsd = goldPriceUsd ?? FALLBACK_GOLD_PRICE_USD;
  const effectiveSilverUsd = silverPriceUsd ?? FALLBACK_SILVER_PRICE_USD;
  const effectiveUsdToInr = usdToInrRate ?? FALLBACK_USD_TO_INR;
  const effectiveUsdToEur = usdToEurRate ?? FALLBACK_USD_TO_EUR;

  const GOLD_PRICE_PER_OUNCE =
    currency === 'USD'
      ? effectiveGoldUsd
      : currency === 'INR'
        ? effectiveGoldUsd * effectiveUsdToInr
        : effectiveGoldUsd * effectiveUsdToEur;

  const SILVER_PRICE_PER_OUNCE =
    currency === 'USD'
      ? effectiveSilverUsd
      : currency === 'INR'
        ? effectiveSilverUsd * effectiveUsdToInr
        : effectiveSilverUsd * effectiveUsdToEur;

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
  const pricePerGramGold = GOLD_PRICE_PER_OUNCE / TROY_OUNCE_TO_GRAMS;
  const pricePerGramSilver = SILVER_PRICE_PER_OUNCE / TROY_OUNCE_TO_GRAMS;
  const nisabGoldValue = NISAB_GOLD_GRAMS * pricePerGramGold;
  const nisabSilverValue = NISAB_SILVER_GRAMS * pricePerGramSilver;

  useEffect(() => {
    let cancelled = false;

    const fetchMetalPrice = async (symbol: 'XAU' | 'XAG') => {
      const response = await fetch(`https://api.gold-api.com/price/${symbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch price for ${symbol}`);
      }
      const data = await response.json();
      if (typeof data?.price !== 'number') {
        throw new Error(`Invalid price data for ${symbol}`);
      }
      return {
        price: data.price as number,
        updatedAt: data.updatedAtReadable || data.updatedAt || '',
      };
    };

    const fetchUsdFx = async () => {
      const primary = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
      const fallback = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json';

      const attempt = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('FX fetch failed');
        const data = await res.json();
        const inr = data?.usd?.inr;
        const eur = data?.usd?.eur;
        if (typeof inr !== 'number' || typeof eur !== 'number') throw new Error('FX rate missing');
        return { inr, eur } as { inr: number; eur: number };
      };

      try {
        return await attempt(primary);
      } catch (error) {
        return await attempt(fallback);
      }
    };

    const load = async () => {
      setLoadingPrices(true);
      setPriceError(null);
      try {
        const [gold, silver, usdFx] = await Promise.all([
          fetchMetalPrice('XAU'),
          fetchMetalPrice('XAG'),
          fetchUsdFx(),
        ]);
        if (cancelled) return;
        setGoldPriceUsd(gold.price);
        setSilverPriceUsd(silver.price);
        setUsdToInrRate(usdFx.inr);
        setUsdToEurRate(usdFx.eur);
        setPriceUpdatedAt(gold.updatedAt || silver.updatedAt || '');
      } catch (error) {
        if (cancelled) return;
        setPriceError('Live prices unavailable, using fallback values.');
      } finally {
        if (!cancelled) {
          setLoadingPrices(false);
        }
      }
    };

    load();
    const interval = setInterval(load, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleInputChange = (field: keyof WealthData, value: string) => {
    const parsed = parseFloat(value);
    setWealth((prev) => ({
      ...prev,
      [field]: Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const calculateZakaat = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const goldValue = (wealth.goldOunces || 0) * pricePerGramGold;
    const silverValue = (wealth.silverOunces || 0) * pricePerGramSilver;
    const liquidAssets = (wealth.cash || 0) + (wealth.savingsAccount || 0);
    const investments = (wealth.stocks || 0) + (wealth.cryptocurrency || 0) + (wealth.otherAssets || 0);
    const totalWealth = goldValue + silverValue + liquidAssets + investments;

    const nisabGold = NISAB_GOLD_GRAMS * pricePerGramGold;
    const nisabSilver = NISAB_SILVER_GRAMS * pricePerGramSilver;
    const nisabThreshold = Math.min(nisabGold, nisabSilver);

    const isEligible = totalWealth >= nisabThreshold;
    const zakaatAmount = isEligible ? totalWealth * ZAKAAT_RATE : 0;

    setResult({
      totalWealth: parseFloat(totalWealth.toFixed(2)),
      nisabThreshold: parseFloat(nisabThreshold.toFixed(2)),
      isEligible,
      zakaatAmount: parseFloat(zakaatAmount.toFixed(2)),
      breakdown: {
        goldValue: parseFloat(goldValue.toFixed(2)),
        silverValue: parseFloat(silverValue.toFixed(2)),
        liquidAssets: parseFloat(liquidAssets.toFixed(2)),
        investments: parseFloat(investments.toFixed(2)),
      },
    });

    setSubmitted(true);
  };

  const resetForm = () => {
    setWealth({
      cash: 0,
      savingsAccount: 0,
      goldOunces: 0,
      silverOunces: 0,
      stocks: 0,
      cryptocurrency: 0,
      otherAssets: 0,
    });
    setResult(null);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                💚
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  Zakaat Calculator
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
                  Calculate your annual Zakaat obligation
                </p>
              </div>
            </div>
            {/* Currency Toggle */}
            <Tabs
              value={currency}
              onValueChange={(value) => {
                const nextCurrency = value as 'USD' | 'INR' | 'EUR';
                setCurrency(nextCurrency);
                setSubmitted(false);
                setResult(null);
              }}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="INR">INR</TabsTrigger>
                <TabsTrigger value="EUR">EUR</TabsTrigger>
                <TabsTrigger value="USD">USD</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800">
                Live prices
              </Badge>
              {loadingPrices ? (
                <span>Updating…</span>
              ) : priceUpdatedAt ? (
                <span>Updated {priceUpdatedAt}</span>
              ) : (
                <span>Using fallback</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Form Section */}
          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-2xl sm:text-3xl">Wealth Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Enter your financial information to calculate Zakaat</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {priceError && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-800 text-xs sm:text-sm border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800">
                  {priceError}
                </div>
              )}
              <form onSubmit={calculateZakaat} className="space-y-6 sm:space-y-8">
                {/* Liquid Assets */}
                <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                      💰
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                      Liquid Assets
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 sm:ml-13">
                    <div className="space-y-2">
                      <Label htmlFor="cash" className="text-sm font-semibold">
                        Cash in Hand
                      </Label>
                      <Input
                        id="cash"
                        type="number"
                        placeholder="0.00"
                        value={wealth.cash || ''}
                        onChange={(e) => handleInputChange('cash', e.target.value)}
                        step="0.01"
                        min="0"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500">{currency}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="savingsAccount" className="text-sm font-semibold">
                        Savings Account
                      </Label>
                      <Input
                        id="savingsAccount"
                        type="number"
                        placeholder="0.00"
                        value={wealth.savingsAccount || ''}
                        onChange={(e) =>
                          handleInputChange('savingsAccount', e.target.value)
                        }
                        step="0.01"
                        min="0"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500">{currency}</p>
                    </div>
                  </div>
                </div>

                {/* Precious Metals */}
                <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                      💎
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                      Precious Metals
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 sm:ml-13">
                    <div className="space-y-2">
                      <Label htmlFor="goldOunces" className="text-sm font-semibold">
                        Gold (grams)
                      </Label>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-300">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Live {currencySymbol}{pricePerGramGold.toLocaleString('en-US', { maximumFractionDigits: 2 })}/g</span>
                      </div>
                      <Input
                        id="goldOunces"
                        type="number"
                        placeholder="0.00"
                        value={wealth.goldOunces || ''}
                        onChange={(e) => handleInputChange('goldOunces', e.target.value)}
                        step="0.01"
                        min="0"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="silverOunces" className="text-sm font-semibold">
                        Silver (grams)
                      </Label>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-300">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Live {currencySymbol}{pricePerGramSilver.toLocaleString('en-US', { maximumFractionDigits: 2 })}/g</span>
                      </div>
                      <Input
                        id="silverOunces"
                        type="number"
                        placeholder="0.00"
                        value={wealth.silverOunces || ''}
                        onChange={(e) =>
                          handleInputChange('silverOunces', e.target.value)
                        }
                        step="0.01"
                        min="0"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Investments */}
                <div className="space-y-4 pb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                      📈
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                      Investments & Assets
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 sm:ml-13">
                    <div className="space-y-2">
                      <Label htmlFor="stocks" className="text-sm font-semibold">
                        Stocks & Bonds
                      </Label>
                      <Input
                        id="stocks"
                        type="number"
                        placeholder="0.00"
                        value={wealth.stocks || ''}
                        onChange={(e) => handleInputChange('stocks', e.target.value)}
                        step="0.01"
                        min="0"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500">{currency}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cryptocurrency" className="text-sm font-semibold">
                        Crypto
                      </Label>
                      <Input
                        id="cryptocurrency"
                        type="number"
                        placeholder="0.00"
                        value={wealth.cryptocurrency || ''}
                        onChange={(e) =>
                          handleInputChange('cryptocurrency', e.target.value)
                        }
                        step="0.01"
                        min="0"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500">{currency}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otherAssets" className="text-sm font-semibold">
                        Other Assets
                      </Label>
                      <Input
                        id="otherAssets"
                        type="number"
                        placeholder="0.00"
                        value={wealth.otherAssets || ''}
                        onChange={(e) =>
                          handleInputChange('otherAssets', e.target.value)
                        }
                        step="0.01"
                        min="0"
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500">{currency}</p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-6">
                  <Button
                    type="submit"
                    disabled={loadingPrices}
                    className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-sm sm:text-base rounded-lg transition-all"
                  >
                    {loadingPrices ? 'Fetching live rates…' : 'Calculate Zakaat'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 h-10 sm:h-12 font-semibold text-sm sm:text-base"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {submitted && result ? (
              <Card className="shadow-lg border-0 sticky top-4 sm:top-6 md:top-8">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl">Results</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Eligibility Status */}
                  <div
                    className={`p-4 sm:p-6 rounded-xl transition-all border-2 ${
                      result.isEligible
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                        : 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-700'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl">{result.isEligible ? '✅' : 'ℹ️'}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                          {result.isEligible ? 'Zakaat Eligible' : 'Not Eligible Yet'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-1">
                          {result.isEligible
                            ? 'Your wealth exceeds Nisab. You are obligated to pay Zakaat.'
                            : 'Your wealth is below Nisab threshold.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-3">
                    <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Total Wealth
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {currencySymbol}{result.totalWealth.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Nisab Threshold
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                          {currencySymbol}{result.nisabThreshold.toLocaleString()}
                        </p>
                        <Badge variant="secondary" className="text-xs">Min. Required</Badge>
                      </div>
                    </div>

                    <div
                      className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${
                        result.isEligible
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-400 dark:border-green-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                        Zakaat Due (2.5%)
                      </p>
                      <p
                        className={`text-3xl sm:text-4xl font-bold ${
                          result.isEligible
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {currencySymbol}{result.zakaatAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-bold text-sm sm:text-base mb-3 text-gray-900 dark:text-white">
                      Wealth Breakdown
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Gold</span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {currencySymbol}{result.breakdown.goldValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-300 dark:border-gray-600 text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Silver</span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {currencySymbol}{result.breakdown.silverValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Liquid</span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {currencySymbol}{result.breakdown.liquidAssets.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Investments</span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {currencySymbol}{result.breakdown.investments.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold mb-2 text-amber-900 dark:text-amber-200">ℹ️ Notes</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <li>Prices are approximate</li>
                      <li>Uses lower of gold/silver Nisab</li>
                      <li>Consult a scholar</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0 sticky top-4 sm:top-6 md:top-8">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl">About Zakaat</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="text-base sm:text-lg">📖</span> What is Zakaat?
                      </h3>
                      <p className="leading-relaxed text-xs sm:text-sm">
                        Zakaat is a pillar of Islam obligating those with sufficient wealth to give to the poor and needy. It is 2.5% of your qualifying wealth.
                      </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="text-base sm:text-lg">💰</span> Nisab Threshold
                      </h3>
                      <p className="leading-relaxed text-xs sm:text-sm">
                        You must reach Nisab (minimum wealth) to be obligated. Set at: 2.5 troy oz gold (≈{NISAB_GOLD_GRAMS.toFixed(1)} g, {currencySymbol}{nisabGoldValue.toLocaleString()}) or 52.5 troy oz silver (≈{NISAB_SILVER_GRAMS.toFixed(1)} g, {currencySymbol}{nisabSilverValue.toLocaleString()}).
                      </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="text-base sm:text-lg">✅</span> What Counts
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <li>Cash & savings</li>
                        <li>Gold & silver</li>
                        <li>Stocks & bonds</li>
                        <li>Cryptocurrency</li>
                        <li>Other assets</li>
                      </ul>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-base sm:text-lg">⚠️</span> Disclaimer
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                        This calculator provides estimates. Consult a qualified Islamic scholar for accurate calculations specific to your situation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZakaatPage;