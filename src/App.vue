<script setup lang="ts">
import { ref } from 'vue';
import { fetchOpreturnMarkers } from './utils'
import { binToHex, utf8ToBin } from '@bitauth/libauth';

const markerInput = ref('')
const isLokadId = ref(true)
const resultingTxIds = ref(undefined as undefined | string[])
const loading = ref(false)
const error = ref('')

const utf8ToHex = (utf8string: string) => binToHex(utf8ToBin(utf8string))
const to4byteHex = (str:string) => str + "0".repeat(8 - str.length)

async function scanOpreturnMarker() {
  resultingTxIds.value = undefined
  loading.value = true
  error.value = ''
  let markerUtftf8Hex = utf8ToHex(markerInput.value.trim())
  if(isLokadId.value) markerUtftf8Hex = to4byteHex(markerUtftf8Hex)
  const bytesEncoding = `0${markerUtftf8Hex.length / 2}`
  // encoding: <opreturn> <push_data> <marker> 
  const opreturnEncoding = '6a' + bytesEncoding + markerUtftf8Hex
  console.log('opreturnEncoding: ', opreturnEncoding)
  try{
    const listTxIds = await fetchOpreturnMarkers(opreturnEncoding)
    resultingTxIds.value = listTxIds
  } catch (e) {
    loading.value = false
    error.value = 'error: something went wrong'
  }
}
</script>

<template>
  <header>
    <h1>Opreturn Scanner 🔎</h1>
    <div>Scan for data markers on the Bitcoin Cash blockchain!</div>
  </header>

  <main style="margin-top: 20px;">
    <div style="margin-bottom: 20px;">
        Scan for marker:
      <input type="test" style="width: 300px; padding: 2px 6px;" v-model="markerInput" @keyup.enter="scanOpreturnMarker"/>
      <div style="margin-bottom: 4px;">
        <label>Use Lokad-Id (fixed 4-byte encoding):</label>
        <input type="checkbox" v-model="isLokadId" style="vertical-align: middle; margin-left: 10px;">      
      </div>
      <button @click="scanOpreturnMarker" style="padding: 4px 16px; cursor: pointer;">Scan</button>
    </div>


    <div v-if="error">{{ error }}</div>
    <div v-if="loading && resultingTxIds == undefined">Loading...</div>
    <div v-if="resultingTxIds != undefined" >
      <details v-if="resultingTxIds.length">
        <summary>
          Show all transactions with marker ({{ resultingTxIds.length }})
        </summary>
        <div>
          <div v-for="txId in resultingTxIds" :key="txId">{{ txId }}</div>
        </div>
      </details><div v-else>
          No transactions found with marker
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h2>List of existing markers:</h2>
      <div>Markers are short UTF8 text strings</div>
      <h3 style="text-decoration: underline; margin-top: 5px;">Lokad-Ids</h3>
      <div>Bitcoin-Cash-Metadata-Registries: <code>BCMR</code></div>
      <div>TapSwap: <code>SWAP</code></div>
      <div>BCH Pump: <code>PUMP</code></div>
      <div>Interplanetary BitcoinCash: <code>IPBC</code></div>
      <div>SLP-Tokens: <code>SLP</code> <small>(scan currently broken, too many txs)</small></div>

      <h3 style="text-decoration: underline; margin-top: 5px;">Custom Markers</h3>
      <div>Cauldron DEX: <code>SUMMON</code></div>
    </div>
  </main>
</template>
