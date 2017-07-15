<template>
  <v-container fluid>
    <v-layout wrap>

    </v-layout>
  </v-container>
</template>

<script>
const axios = require('axios')
export default {
  name: 'Example',
  mounted() {
  },
  data() {
    return {
      api: require('../services/api.js'),
    }
  },
  methods: {
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
