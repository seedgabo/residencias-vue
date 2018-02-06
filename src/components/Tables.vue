<template lang="jade">
	div
		v-container()
			visitors(v-if="tab==='visitors'")
			vehicles(v-if="tab==='vehicles'")
			parkings(v-if="tab==='parkings'")
			workers(v-if="tab==='workers'")
			pets(v-show="tab==='pets'")
		v-bottom-nav.white(:value="true",:active.sync="tab")
			v-btn(flat color="primary", :value="'visitors'")
				span {{api.trans('literals.visitors')}}
				v-icon people
			v-btn(flat color="primary", :value="'vehicles'")
				span {{api.trans('literals.vehicles')}}
				v-icon directions_car
			v-btn(flat color="primary" , :value="'parkings'")
				span {{api.trans('literals.parkings')}}
				v-icon local_parking
			v-btn(flat color="primary", :value="'workers'")
				span {{api.trans('literals.workers')}}
				v-icon work
			v-btn(flat color="primary", :value="'pets'")
				span {{api.trans('literals.pets')}}
				v-icon pets
</template>

<script lang="coffee">
Visitors=require '@/components/Visitors'
Vehicles=require '@/components/Vehicles'
Workers=require '@/components/Workers'
Parkings=require '@/components/Parkings'
Pets=require '@/components/Pets'

module.exports =
	name: 'Tables'
	components:
		visitors:Visitors
		vehicles:Vehicles
		workers:Workers
		parkings:Parkings
		pets:Pets
	mounted: ()->
		window.addEventListener('resize', @handleResize)
	beforeDestroy: ()->
		window.removeEventListener('resize', @handleResize)
	data: ->
		api: require '../services/api.js'
		tab: 'visitors'
		windowWidth: document.documentElement.clientWidth
	methods:
		getData: ()->
			@api.get 'data'
			.then (resp)=>
				console.log resp.data
			.catch console.error
		handleResize: (ev)->
			@windowWidth = document.documentElement.clientWidth
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>
