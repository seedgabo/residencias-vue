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
				input(type="file" ref="inputImageTicket" style="display:none;", @change="readFile")
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

						v-btn(v-if="!ticket.id || !ticket.file_id" block @click="askFile" color="light")
							span(v-if="!file") {{ api.trans('crud.upload') }} {{ api.trans('literals.file') }}
							span(v-if="file") {{ file_name }}


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
					v-container(fluid)
						h3.text-xs-center.headline {{ticket.subject}}
						div.elevation-3.pa-3
							p(v-html="ticket.text")
							v-btn(block color="primary" v-if="ticket.file" @click="downloadFile()")
								span {{ api.trans('literals.download') }} {{ticket.file.name}}
							v-select(v-bind:items="statuses" v-model="ticket.status", :label="api.trans('literals.status')" v-on:change="updateStatus")
						h4.text-xs-center.headline.primary--text {{api.trans('literals.comments')}}
						div.text-xs-center
							v-text-field(multi-line :label="api.trans('literals.comment')" v-model="new_comment.text" )
							v-btn(block @click="()=>{askFile(true)}" small  color="light")
								span(v-if="!file") {{ api.trans('crud.upload') }} {{ api.trans('literals.file') }}
								span(v-if="file") {{ file_name }}
							v-btn(flat color="orange", :disabled="new_comment.text.length < 3 || isSaving" @click="addComment()") {{api.trans('crud.add')}} {{api.trans('literals.comment')}}
						v-flex.pa-3
							v-card.pa-3(v-for="com in ticket.comments", :key="com.id" )
								v-card-title(style="word-break: break-all;") {{com.text}}
								v-card-actions
									span.primary--text(v-if="com.user")
										v-avatar(size="22px", :title="com.user.name")
											img(:src="com.user.image_url" )
										span {{com.user.name}}
										span(v-if="com.user.residence")  - {{com.user.residence.name}}
									v-spacer
									small {{ com.created_at | moment("from") }}
									v-btn(@click="downloadFile(com.file)" v-if="com.file" small flat color="primary")
										v-icon file_download
										span {{api.trans('literals.download')}}
										span &nbsp; {{api.trans('literals.file')}}
		v-snackbar.success(:timeout="3000" top right v-model="success")
			span {{api.trans('literals.ticket')}}  {{api.trans('crud.updated')}}
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
		file:null
		file_name:""
		new_comment: {text:"",user_id:api.user.id}
		commentFile:null
	methods:
		getData: ()->
			@api.get "tickets?where[user_id]=#{@api.user.id}&with[]=user&with[]=comments&with[]=comments.user&with[]=comments.user.residence&with[]=comments.file&with[]=file&with[]=user.residence&order[updated_at]=desc&take=300"
			.then (resp)=>
				console.log 'data', resp.data
				@tickets = resp.data
			.catch console.error
		seeTicket: (ticket)->
			console.log ticket
			@ticket = ticket
			@api.get("comments?where[ticket_id]=#{@ticket.id}&with[]=user.residence&with[]=file")
			.then (comments)=>
				@ticket.comments = comments.data
			.catch console.error
			@open = true
		editTicket: (ticket)->
			@ticket = ticket
			@editor = true
			return
		createTicket: (ticket)->
			@ticket = {
				subject:"",
				status:"open",
				text:"",
				user_id: @api.user.id
				residence_id: @api.user.residence_id
			}
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
			data = {
				subject: @ticket.subject,
				text:@ticket.text,
				status:@ticket.status,
				user_id: @ticket.user_id
				residence_id: @ticket.residence_id
			}
			@isSaving = true
			if @ticket.id
				promise = @api.put("tickets/#{@ticket.id}",data)
			else
				promise = @api.post("tickets",data)

			promise.then (resp)=>
				console.log resp.data
				if @file?
					@uploadFile(resp.data.id)
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
		downloadFile: (file)->
			if not file?
				file = @ticket.file
			element = document.createElement('a')
			element.setAttribute('href', @api.url.replace('api/','files/') + file.id)
			element.setAttribute('download', file.name)
			element.style.display = 'none'
			document.body.appendChild(element)
			element.click()
			document.body.removeChild(element)
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
				if @file?
					@uploadFile(resp.data.id,resp.data)
			.catch (err)=>
				@isSaving = false
				alert("Error", JSON.stringify(err))
		askFile: (is_comment=false)->
			@commentFile = is_comment
			@$refs.inputImageTicket.click()
		readFile: (evt)->
			try
				reader = new FileReader
				if evt.target.files[0].size / 1024 / 1024 > 5
					return @errorFile evt.target.files[0].size
				@file = evt.target.files[0]
				@file_name = evt.target.files[0].name
			catch error
				@file = null
				console.error error
		uploadFile: (id, comment)->
			if @commentFile?
				type = 'comment'
			else
				type = 'ticket'
			formData = new FormData()
			xhr = new XMLHttpRequest()
			xhr.open('POST', @api.url + "files/upload/#{type}/" + id, true)
			formData.append('file', @file, @file_name)
			xhr.onload = ()=>
				if (xhr.status == 200)
					@file = null
					@file_name = ""
					if @commentFile
						@seeTicket(@ticket)
						@commentFile = false
				else
					alert("ERROR", xhr.status)
					console.error(xhr)
			xhr.setRequestHeader("Auth-Token", @api.user.token)
			xhr.send(formData)
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
