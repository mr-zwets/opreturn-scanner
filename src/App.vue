<script setup lang="ts">
import { computed, ref } from 'vue';
import { fetchOpreturnMarkers } from './utils'
import { binToHex, utf8ToBin } from '@bitauth/libauth';

const blockExplorer = "https://explorer.bch.ninja/tx/"

const markerInput = ref('')
const useLokadIdUnder4Bytes = ref(true)
const encodedMarker = ref('')
const resultingTxIds = ref(undefined as undefined | string[])
const loading = ref(false)
const error = ref('')

const utf8ToHex = (utf8string: string) => binToHex(utf8ToBin(utf8string))
const to4byteHex = (str:string) => str + "0".repeat(8 - str.length)

const markerLength = computed(() => {
  return utf8ToHex(markerInput.value.trim()).length
})

async function scanOpreturnMarker() {
  resultingTxIds.value = undefined
  loading.value = true
  error.value = ''
  let markerUtftf8Hex = utf8ToHex(markerInput.value.trim())
  // if marker is less than 4 bytes, check if user wants to use fixed 4-byte encoding
  if(useLokadIdUnder4Bytes.value && markerUtftf8Hex.length < 8){
    markerUtftf8Hex = to4byteHex(markerUtftf8Hex)
  }
  encodedMarker.value = markerUtftf8Hex
  const bytesEncoding = `0${markerUtftf8Hex.length / 2}`
  // encoding: <opreturn> <push_data> <marker> 
  const opreturnEncoding = '6a' + bytesEncoding + markerUtftf8Hex
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
      <input v-model="markerInput" style="margin-left: 2px; width: 260px; padding: 4px 6px;" @keyup.enter="scanOpreturnMarker"/>
      <button @click="scanOpreturnMarker" style="padding: 4px 20px; cursor: pointer; margin-left: 6px;">
        Scan
      </button>
      <div v-if="markerLength && markerLength < 8">
        <label>Use Lokad-Id (fixed 4-byte encoding):</label>
        <input type="checkbox" v-model="useLokadIdUnder4Bytes" style="vertical-align: middle; margin-left: 10px;">      
      </div>
      <div v-else-if="markerLength == 8">Type: Lokad-Id</div>
      <div v-else-if="markerLength > 8">Type: Custom Marker</div>
    </div>

    <div v-if="encodedMarker">
      Hex encoding for marker: <code>{{ encodedMarker }}</code>
    </div>

    <div v-if="error">{{ error }}</div>
    <div v-if="loading && resultingTxIds == undefined">Scanning...</div>
    <div v-if="resultingTxIds != undefined" >
      <details v-if="resultingTxIds.length">
        <summary>
          Show all transactions with marker ({{ resultingTxIds.length }})
        </summary>
        <div>
          <div v-for="txId in resultingTxIds" :key="txId" style="margin: 1px 0;">
            <a :href="blockExplorer + txId" target="_blank" style="color: black;">{{ txId }}</a>
          </div>
        </div>
      </details><div v-else>
          No transactions found with marker
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h2>List of existing markers:</h2>
      <div>Markers are short UTF-8 (case-sensitive) text strings </div>
      <div>Lokad-Ids have a fixed 4-byte encoding</div>
      <h3 style="text-decoration: underline; margin-top: 5px;">Lokad-Ids</h3>
      <div>Bitcoin-Cash-Metadata-Registries: <code>BCMR</code></div>
      <div>TapSwap: <code>MPSW</code></div>
      <div>BCH Pump: <code>PUMP</code></div>
      <div>Interplanetary BitcoinCash: <code>IPBC</code></div>
      <div>Hodl Plugin: <code>hodl</code></div>
      <div>Unspent Phi: <code>utxo</code></div>
      <div>Licho's protocols: <code>>sh</code></div>
      <div>SLP-Tokens: <code>SLP</code> <small>(scan currently broken, too many txs)</small></div>

      <h3 style="text-decoration: underline; margin-top: 5px;">Custom Markers</h3>
      <div>Cauldron DEX: <code>SUMMON</code></div>
    </div>
  </main>
</template>
