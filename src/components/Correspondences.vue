<template lang="jade">
	v-container(fluid="")
		v-layout(wrap="")
			v-flex(xs12="")
				v-progress-linear(indeterminate color="primary" v-if="loading")
				v-card
					v-toolbar.primary(dark)
						v-text-field(v-model="query" solo prepend-icon="search" placeholder="Search" v-if="search" v-on:input="filter()" append-icon="close", :append-icon-cb="clear")
						v-icon(dark v-if="!search") markunread_mailbox
						v-toolbar-title.text-capitalize(v-if="!search") {{ api.trans('literals.correspondences') }}
						v-spacer(v-if="!search")
						v-icon(@click="search=!search; query='';filter()" v-if="!search" dark) {{ search ? 'close' : 'search' }}
					v-card-text
						v-expansion-panel
							v-expansion-panel-content(v-for="corres in correspondences", :key="corres.id")
								div(slot="header")
									v-icon(:class="(corres.status == 'delivered' ? 'green' : 'dark') +'--text'")
										| mail_outline
									span &nbsp;
									span.text-capitalize {{corres.item}}
									span(v-if="corres.quantity > 1") &nbsp; ({{corres.quantity}})
								v-card
									v-card-text.grey.lighten-3(@click.stop="actions(corres)")
										b {{api.trans('literals.'+corres.status)}}
										div(v-if="corres.receptor")
											b {{api.trans('literals.receptor')}}:
											span {{corres.receptor.name}}
										small.text-capitalize &nbsp; {{corres.created_at | moment('calendar') }}
						//- v-list(three-line)
							v-list-tile(v-for="corres in correspondences", :key="corres.id", @click.stop="actions(corres)")
								v-list-tile-content
									v-list-tile-title
										span.text-capitalize {{corres.item}}
										span(v-if="corres.quantity > 1")&nbsp; ({{corres.quantity}})
									v-list-tile-sub-title
										b {{api.trans('literals.'+corres.status)}}
										div(v-if="corres.receptor")
											b {{api.trans('literals.receptor')}}:
											span {{corres.receptor.name}}
										small.text-capitalize &nbsp; {{corres.created_at | moment('calendar') }}
								v-list-tile-action
									v-icon(:class="(corres.status == 'delivered' ? 'green' : 'dark') +'--text'")
										| mail_outline
		v-bottom-sheet(v-model="sheet" lazy)
			v-list
				v-subheader(v-if="selected") {{api.trans('literals.correspondence')}} {{selected.item}}
				v-list-tile(@click="markAsDone(selected)")
					v-list-tile-avatar
						v-avatar(size="32px" tile)
							v-icon email
					v-list-tile-title {{api.trans('__.marcar como recogido')}}
				v-list-tile
					v-list-tile-avatar
						v-avatar(size="32px" tile)
							v-icon close
					v-list-tile-title {{api.trans('crud.cancel')}}

</template>

<script lang="coffee">
api = require '../services/api.js'
module.exports =
	name: 'Correspondences'
	mounted: ()->
		@getData()
	data: ->
		api: api
		correspondences: []
		_correspondences: []
		loading:false
		sheet: false
		selected: null
		search:false
		query: ""
	methods:
		getData: ()->
			@loading = true
			@api.get "correspondences?limit=500&where[residence_id]=#{@api.user.residence_id}&order[created_at]=desc&with[]=receptor"
			.then (resp)=>
				console.log 'data', resp.data
				@_correspondences = resp.data
				@filter()
				@loading = false
			.catch console.error
		actions: (corres)->
			@selected = corres
			@sheet = true
		markAsDone: (corres)->
			@api.post("correspondences/#{corres.id}/delivered",{})
			.then (resp)=>
				corres.status = delivered

			.catch console.error
		filter: ()->
			if @query.length == 0
				return @correspondences = @_correspondences
			filtered = @query.toLowerCase()
			@correspondences = @_correspondences.filter (corres)=>
				corres.item.toLowerCase().indexOf(filtered) > -1
		clear: ()->
			@search=false
			@query = ''
			@filter()


</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>