<template lang="jade">
	v-container()
		v-layout(wrap="")
			v-flex(sm-12)
				v-card
					v-toolbar.primary(dark)
						v-icon(dark) fa-ticket
						v-toolbar-title {{ api.trans('literals.tickets') }}
					v-card-text
						v-list(two-line)
							v-list-tile(v-for="ticket in tickets", :key="ticket.id" @click.stop="seeTicket(ticket)")
								v-list-tile-content
									v-list-tile-title {{ticket.subject}}
										small &nbsp; ({{ ticket.comments.length }})
									v-list-tile-sub-title(:class="ticket.status") {{ api.trans('literals.'+ticket.status)}}
									v-list-tile-sub-title() {{ ticket.updated_at | moment("from") }}
								v-list-tile-action
									v-list-tile-action-text 
										v-btn(icon small @click.stop="editTicket(ticket)")
											v-icon edit
		v-btn(fab dark color="pink" fixed bottom right @click="createTicket()")
			v-icon add
		v-dialog(v-model="editor" fullscreen transition="dialog-bottom-transition", :overlay="false")
			v-card
				v-toolbar(dark color="primary")
					v-toolbar-title(v-if="ticket") {{ticket.subject}}
					v-spacer
					v-btn(flat :disabled="!canSave()" @click="save()") {{api.trans('crud.save')}}
					v-btn(icon @click.native="editor=false")
						v-icon close
				v-card-text(v-if="ticket")
					v-container
						v-text-field(v-model="ticket.subject", :placeholder="api.trans('literals.subject')", :label="api.trans('literals.subject')")

						v-text-field(v-model="ticket.text", :placeholder="api.trans('literals.text')", :label="api.trans('literals.text')" multi-line)

						v-select(disabled v-bind:items="statuses" v-model="ticket.status", :label="api.trans('literals.status')" single-line bottom)

						v-flex(xs12="" v-if="canSave()")
							v-btn(:disabled="isSaving" color="primary" @click="save()") {{api.trans('crud.save')}}


		v-dialog(v-model="open" fullscreen transition="dialog-bottom-transition", :overlay="false")
			v-card
				v-toolbar(dark color="primary")
					v-toolbar-title(v-if="ticket") {{ticket.subject}}
					v-spacer
					v-btn(icon @click.native="open=false")
						v-icon close
				v-card-text(v-if="ticket")
					v-container
						h3.text-xs-center.headline {{ticket.subject}}
						div.elevation-3.pa-3
							p(v-html="ticket.text")
							v-select(v-bind:items="statuses" v-model="ticket.status", :label="api.trans('literals.status')" v-on:change="updateStatus")
						h4.text-xs-center.headline.primary--text {{api.trans('literals.comments')}}
						div.text-xs-center
							v-text-field(multi-line :label="api.trans('literals.comment')" v-model="new_comment.text" )
							v-btn(flat color="orange", :disabled="new_comment.text.length < 3 || isSaving" @click="addComment()") {{api.trans('crud.add')}} {{api.trans('literals.comment')}}
						v-list.elevation-3.pa-3
							v-list-tile(v-for="com in ticket.comments", :key="com.id" avatar three-line)
								v-list-tile-content
									v-list-tile-title {{com.text}}
									v-list-tile-sub-title: small {{ com.created_at | moment("from") }}
								v-list-tile-action
									small(v-if="com.user") 
										v-avatar(size="22px", :title="com.user.name") 
											img(:src="com.user.image_url" )
										span.hidden-sm-and-down {{com.user.name}}
										span.hidden-sm-and-down(v-if="com.user.residence") - {{com.user.residence.name}}
		v-snackbar.success(:timeout="3000" top right v-model="success")
			span {{api.trans('literals.ticket')}}  {{api.trans('crud.saved')}}
			v-btn(flat @click.native="success=false" icon)
				v-icon close
</template>

<script lang="coffee">
api = require '../services/api.js'
module.exports =
	name: 'Tickets'
	mounted: ()->
		console.log @api
		@getData()
	data: ->
		api: api
		tickets: []
		ticket:null
		editor:false
		open:false
		success: false
		isSaving: false
		statuses: [
			{ text: api.trans('literals.open'), value: 'open' }
			{ text: api.trans('literals.closed'), value: 'closed' }
			{ text: api.trans('literals.in progress'), value: 'in progress' }
			{ text: api.trans('literals.rejected'), value: 'rejected' }
		]
		new_comment: {text:"",user_id:api.user.id}
	methods:
		getData: ()->
			@api.get "tickets?where[user_id]=#{@api.user.id}&with[]=user&with[]=comments&with[]=comments.user&with[]=comments.user.residence&with[]=user.residence&order[updated_at]=desc&take=300"
			.then (resp)=>
				console.log 'data', resp.data
				@tickets = resp.data
			.catch console.error
		seeTicket: (ticket)->
			console.log ticket
			@ticket = ticket
			@open = true
		editTicket: (ticket)->
			@ticket = ticket
			@editor = true
			return
		createTicket: (ticket)->
			@ticket = {subject:"",status:"open",text:"", user_id: @api.user.id}
			@editor = true
			return
		updateStatus:(value)->
			console.log value
			@isSaving = true
			@api.put("tickets/#{@ticket.id}",{status:value})
			.then (resp)=>
				@isSaving = false
				@success = true
				@open = false

				

		canSave: ()->
			@ticket && @ticket.subject.length > 2 && @ticket.text.length > 2
		save: ()->
			data = {subject: @ticket.subject, text:@ticket.text, status:@ticket.status, user_id: @ticket.user_id}
			@isSaving = true
			if @ticket.id
				promise = @api.put("tickets/#{@ticket.id}",data)
			else
				promise = @api.post("tickets",data)
			
			promise.then (resp)=>
				console.log resp.data
				if not @ticket.id
					resp.data.user = @api.user
					resp.data.comments = []
					@tickets.unshift resp.data
				@isSaving = false
				@success=true
				@ticket = null
				@editor = false
			.catch (err)=>
				@isSaving = false
				alert("Error", JSON.stringify(err))

		addComment: ()->
			@isSaving = true
			@new_comment.ticket_id = @ticket.id
			@api.post("comments", @new_comment)
			.then (resp)=>
				@isSaving = false
				@new_comment.text = ""
				resp.data.user = @api.user
				@success = true
				@ticket.comments.push resp.data
			.catch (err)=>
				@isSaving = false
				alert("Error", JSON.stringify(err))
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.open {
	color: #4CAF50 !important;
}

.in.progress {
	color: #FFEB3B !important;
}

.closed {
	color: #2196F3 !important;
}

.rejected {
	color: #F44336 !important;
}
</style>