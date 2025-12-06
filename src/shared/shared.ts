const to12Hour = (time: string): string => {
    const clean = time.split(" ")[0]
    const [hStr, mStr] = clean.split(":")
    let h = Number(hStr)
    const m = Number(mStr)
    if (isNaN(h) || isNaN(m)) return time

    const suffix = h >= 12 ? "PM" : "AM"
    h = h % 12
    if (h === 0) h = 12

    return `${h}:${m.toString().padStart(2, "0")} ${suffix}`
}

const getNearbyMosquesUrl = (lat: number, lon: number): string => {
  const query = `mosques near ${lat},${lon}`;

  const params = new URLSearchParams({
    api: "1",
    query,
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export { 
    to12Hour,
    getNearbyMosquesUrl,
}