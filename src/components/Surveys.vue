<template lang="jade">
	v-container(fluid="")
		v-layout(wrap="")
			v-flex(xs12="" sm6="") 
				span {{name}}
				v-text-field(v-model="name")
</template>

<script lang="coffee">
module.exports =
	name: 'Invoices'
	mounted: ()->
		console.log @api
	data: ->
		api: require '../services/api.js'
		name: 'gabo Coffee'
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>

</style>
