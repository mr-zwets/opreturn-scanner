<script setup lang="ts">
import { ref } from 'vue';
import { fetchOpreturnMarkers } from './utils'
import { binToHex, utf8ToBin } from '@bitauth/libauth';

const markerInput = ref('')
const resultingTxIds = ref(undefined as undefined | string[])

function utf8ToHex(utf8string: string) {
  const utf8Binary = utf8ToBin(utf8string)
  return binToHex(utf8Binary)
}

async function scanOpreturnMarker() {
  const markerUtftf8Hex = '6a' + utf8ToHex(markerInput.value.trim())
  const listTxIds = await fetchOpreturnMarkers(markerUtftf8Hex)
  resultingTxIds.value = listTxIds
}
</script>

<template>
  <header>
    <h1>Opreturn Scanner</h1>
  </header>

  <main style="margin-top: 20px;">
    scan for opreturn marker (UTF8-encoding):
    <input type="test" style="width: 200px;" v-model="markerInput" @keyup.enter="scanOpreturnMarker"/>

    <details v-if="resultingTxIds != undefined" style="margin-top: 20px;">
      <div v-if="resultingTxIds.length">
        <summary>
          Show all transactions with marker ({{ resultingTxIds.length }})
        </summary>
        <div>
          <div v-for="txId in resultingTxIds" :key="txId">{{ txId }}</div>
        </div>
      </div><div v-else>
          No transactions found with marker
      </div>
    </details>

    <div style="margin-top: 20px;">
      <h2>List of existing markers:</h2>
      <div>Cauldron: <code>SUMMON</code></div>
      <div>SLP Tokens: <code>SLP</code></div>
    </div>
  </main>
</template>
