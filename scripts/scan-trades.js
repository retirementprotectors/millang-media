#!/usr/bin/env node
/**
 * Millang Media — Central Iowa Trades Prospector
 * Scans Google Places API for all trade types across central Iowa cities
 */

const API_KEY = 'AIzaSyAbTkZZnTZzvFwqd1Ni-ZZMXChxKE9skoM';

const CITIES = [
  { name: 'Des Moines', lat: 41.5868, lng: -93.6250 },
  { name: 'West Des Moines', lat: 41.5772, lng: -93.7113 },
  { name: 'Ankeny', lat: 41.7318, lng: -93.6001 },
  { name: 'Ames', lat: 42.0308, lng: -93.6319 },
  { name: 'Urbandale', lat: 41.6266, lng: -93.7122 },
  { name: 'Johnston', lat: 41.6730, lng: -93.6977 },
  { name: 'Waukee', lat: 41.6116, lng: -93.8852 },
  { name: 'Grimes', lat: 41.6883, lng: -93.7910 },
  { name: 'Altoona', lat: 41.6441, lng: -93.4646 },
  { name: 'Bondurant', lat: 41.7003, lng: -93.4622 },
  { name: 'Clive', lat: 41.6033, lng: -93.7241 },
  { name: 'Indianola', lat: 41.3578, lng: -93.5572 },
  { name: 'Norwalk', lat: 41.4756, lng: -93.6783 },
  { name: 'Pleasant Hill', lat: 41.5839, lng: -93.5198 },
  { name: 'Carlisle', lat: 41.5008, lng: -93.4911 },
  { name: 'Perry', lat: 41.8383, lng: -94.1072 },
  { name: 'Newton', lat: 41.6998, lng: -93.0479 },
  { name: 'Marshalltown', lat: 42.0494, lng: -92.9080 },
  { name: 'Boone', lat: 42.0597, lng: -93.8802 },
  { name: 'Pella', lat: 41.4086, lng: -92.9163 },
  { name: 'Oskaloosa', lat: 41.2964, lng: -92.6444 },
  { name: 'Knoxville', lat: 41.3209, lng: -93.0988 },
  { name: 'Dallas Center', lat: 41.6844, lng: -93.9611 },
  { name: 'Adel', lat: 41.6147, lng: -94.0175 },
  { name: 'Nevada', lat: 42.0230, lng: -93.4516 },
  { name: 'Huxley', lat: 41.8953, lng: -93.6016 },
  { name: 'Winterset', lat: 41.3306, lng: -94.0136 },
  { name: 'Polk City', lat: 41.7711, lng: -93.7131 },
  { name: 'Mitchellville', lat: 41.6678, lng: -93.3583 },
  { name: 'Prairie City', lat: 41.5992, lng: -93.2347 },
];

const TRADES = [
  { type: 'electrician', keywords: ['electrician', 'electrical contractor'] },
  { type: 'hvac', keywords: ['hvac', 'heating and cooling'] },
  { type: 'roofer', keywords: ['roofing contractor', 'roofer'] },
  { type: 'landscaper', keywords: ['landscaping', 'lawn care service'] },
  { type: 'painter', keywords: ['painting contractor', 'house painter'] },
  { type: 'general_contractor', keywords: ['general contractor', 'home remodeling'] },
  { type: 'plumber', keywords: ['plumber', 'plumbing'] },
];

const seen = new Map();
const results = [];

async function searchPlaces(query, lat, lng) {
  const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + encodeURIComponent(query) + '&location=' + lat + ',' + lng + '&radius=40000&key=' + API_KEY;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('  API error: ' + data.status + ' ' + (data.error_message || ''));
      return [];
    }
    return data.results || [];
  } catch (err) {
    console.error('  Fetch error: ' + err.message);
    return [];
  }
}

async function getPlaceDetails(placeId) {
  const fields = 'formatted_phone_number,website,address_components,formatted_address';
  const url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeId + '&fields=' + fields + '&key=' + API_KEY;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    return data.result || {};
  } catch (err) { return {}; }
}

function extractFromAddress(parts, type) {
  if (!parts) return '';
  const match = parts.find(c => c.types.includes(type));
  return match ? (type === 'administrative_area_level_1' ? match.short_name : match.long_name) : '';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('===========================================');
  console.log(' Millang Media - Central Iowa Trade Scan');
  console.log(' ' + CITIES.length + ' cities x ' + TRADES.length + ' trades');
  console.log('===========================================\n');

  let searchCount = 0;

  for (const trade of TRADES) {
    console.log('\nScanning: ' + trade.type.toUpperCase());
    console.log('-------------------------------------------');

    for (const city of CITIES) {
      for (const keyword of trade.keywords) {
        const query = keyword + ' in ' + city.name + ', Iowa';
        const places = await searchPlaces(query, city.lat, city.lng);
        searchCount++;

        for (const place of places) {
          if (seen.has(place.place_id)) continue;

          const details = await getPlaceDetails(place.place_id);
          await sleep(100);

          const phone = details.formatted_phone_number || '';
          const website = details.website || '';
          const hasWebsite = website ? 'YES' : 'NO';
          const ap = details.address_components || [];
          const cityName = extractFromAddress(ap, 'locality') || city.name;
          const state = extractFromAddress(ap, 'administrative_area_level_1') || 'IA';
          const zip = extractFromAddress(ap, 'postal_code') || '';

          if (state !== 'IA') continue;

          const biz = {
            name: place.name,
            address: details.formatted_address || place.formatted_address || '',
            city: cityName,
            state: state,
            zip: zip,
            phone: phone,
            hasWebsite: hasWebsite,
            webUrl: website,
            rating: place.rating ? String(place.rating) : 'N/A',
            reviews: place.user_ratings_total || 0,
            trade: trade.type,
            placeId: place.place_id,
          };

          seen.set(place.place_id, biz);
          results.push(biz);

          const siteTag = hasWebsite === 'NO' ? 'NO SITE' : 'has site';
          console.log('  + ' + biz.name + ' | ' + biz.city + ' | ' + (biz.phone || 'no phone') + ' | ' + siteTag + ' | ' + biz.rating + ' (' + biz.reviews + ')');
        }

        await sleep(200);
      }
    }
  }

  console.log('\n===========================================');
  console.log(' SCAN COMPLETE');
  console.log(' Searches: ' + searchCount);
  console.log(' Unique businesses: ' + results.length);
  console.log(' Without websites: ' + results.filter(r => r.hasWebsite === 'NO').length);
  console.log('===========================================\n');

  console.log('By Trade:');
  for (const trade of TRADES) {
    const tr = results.filter(r => r.trade === trade.type);
    const noSite = tr.filter(r => r.hasWebsite === 'NO');
    console.log('  ' + trade.type.padEnd(20) + tr.length + ' found | ' + noSite.length + ' without website');
  }

  const fs = require('fs');
  const path = require('path');
  const outDir = path.join(__dirname, '..', 'data');

  fs.writeFileSync(path.join(outDir, 'all-trades.json'), JSON.stringify(results, null, 2));
  console.log('\nSaved: data/all-trades.json (' + results.length + ' businesses)');

  const csvHeader = 'name,address,city,state,zip,phone,has_website,website_url,google_rating,review_count,trade,status,notes,last_contacted';
  const csvRows = results.map(r =>
    '"' + r.name.replace(/"/g, '""') + '","' + r.address.replace(/"/g, '""') + '","' + r.city + '","' + r.state + '","' + r.zip + '","' + r.phone + '","' + r.hasWebsite + '","' + r.webUrl + '","' + r.rating + '","' + r.reviews + '","' + r.trade + '","NEW","",""'
  );
  fs.writeFileSync(path.join(outDir, 'all-trades.csv'), csvHeader + '\n' + csvRows.join('\n'));
  console.log('Saved: data/all-trades.csv');

  // CRM seed format
  const seedEntries = results.map(r =>
    '{name:"' + r.name.replace(/"/g, '\\"') + '",address:"' + r.address.replace(/"/g, '\\"') + '",city:"' + r.city + '",state:"' + r.state + '",zip:"' + r.zip + '",phone:"' + r.phone + '",hasWebsite:"' + r.hasWebsite + '",webUrl:"' + r.webUrl + '",rating:"' + r.rating + '",reviews:' + r.reviews + ',trade:"' + r.trade + '"}'
  );
  fs.writeFileSync(path.join(outDir, 'crm-seed.js'), 'const NEW_PROSPECTS = [\n' + seedEntries.join(',\n') + '\n];\n');
  console.log('Saved: data/crm-seed.js (ready for CRM import)\n');

  // Hot prospects
  const hot = results.filter(r => r.hasWebsite === 'NO' && parseFloat(r.rating) >= 4.0 && r.reviews >= 10);
  if (hot.length > 0) {
    hot.sort((a, b) => b.reviews - a.reviews);
    console.log('HOT PROSPECTS (no website + 4+ stars + 10+ reviews): ' + hot.length);
    console.log('-------------------------------------------');
    hot.forEach((h, i) => {
      console.log('  ' + (i+1) + '. ' + h.name + ' (' + h.trade + ') | ' + h.city + ' | ' + h.rating + ' (' + h.reviews + ' reviews) | ' + h.phone);
    });
  }
}

main().catch(console.error);
