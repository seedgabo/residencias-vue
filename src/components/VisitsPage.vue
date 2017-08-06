<template lang="jade">
v-container(fluid="")
  v-layout(wrap="")
    v-flex.mt-2(sm6)
      visitors(v-on:visitorSelected="getVisitsFrom", :selectable="true")
    v-flex.mt-2(sm6)
      visits(:filters="filters")
</template>

<script lang="coffee">
Visitors=require '@/components/Visitors'
Visits=require '@/components/Visits'
module.exports =
  name: 'VisitsPage'
  components:
    visitors:Visitors
    visits:Visits
  mounted: ()->
    console.log @api
  data: ->
    api: require '../services/api.js'
    filters:{visitor:null}
  methods:
    getData: ()->
      @api.get 'data'
      .then (resp)=>
        console.log 'data', resp.data
      .catch console.error
    getVisitsFrom: (evt)->
      console.log evt.visitor
      @filters.visitor = evt.visitor
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>

</style>
