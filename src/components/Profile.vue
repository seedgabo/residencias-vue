<template lang="jade">
v-container(fluid='')
  v-layout(wrap='')
    input(type="file" ref="inputImage" style="display:none;", @change="fileUploaded" accept="image/*")
    // CARD PROFILE
    v-flex.mt-3(xs12='', sm6='', md4='')
      v-card.mx-1
        v-card-media.white--text(src=' https://ak2.picdn.net/shutterstock/videos/23151772/thumb/1.jpg ', height='150px')
          v-container(fill-height='', fluid='')
            v-layout(fill-height='', wrap='')
              v-flex(xs12='', align-center='', flexbox='')
                img.avatar.medium(:src='api.user.image_url', @click="askFile(api.user)")
              v-flex(xs12='', align-end='', flexbox='')
                span.headline {{api.user.name}}
        v-card-text(style='height: 1px; position: relative')
          v-btn.pink(absolute='', small='', dark='', fab='', top='', right='', @click.native='updateUser()')
            v-icon save
          v-subheader.grey--text.text--lighten-1 Profile
        v-card-title
          v-layout(row='', wrap='')
            v-flex(xs12='', style='width:100%')
              v-text-field(prepend-icon='account_circle', type='text', v-model='api.user.name', :label="api.trans('literals.name')", :rules='[rules.required]')
            v-flex(xs12='', style='width:100%')
              v-text-field(prepend-icon='email', type='email', v-model='api.user.email', :label="api.trans('literals.email')", :rules='[rules.required,rules.email]')
            v-flex(xs12='', style='width:100%')
              v-text-field(prepend-icon='card_membership', type='number', v-model='api.user.document', :label="api.trans('literals.document')", :rules='[rules.document]', min='1000', max='1000000000')
            v-flex(xs12='', style='width:100%')
              v-text-field(prepend-icon='phone', type='number', v-model='api.user.phone_number', :label="api.trans('literals.phone_number')")
            v-flex(xs12='', style='width:100%')
              v-select(prepend-icon='wc', v-model='api.user.sex', v-bind:items='genders', :label="api.trans('literals.sex')")
            v-flex(xs12='', style='width:100%')
              v-select(v-if="api.user.id !== api.residence.owner_id" prepend-icon='face', v-model='api.user.relationship', v-bind:items='relationships', :label="api.trans('literals.relationship')")
            v-flex(xs12='', style='width:100%')
              v-menu(lazy='', :close-on-content-click='true', offset-y='', full-width='', :nudge-left='40', max-width='290px')
                v-text-field(slot='activator', :label="api.trans('literals.birthday')", v-model='api.user.birthday', prepend-icon='event', readonly='')
                v-date-picker(v-model='api.user.birthday', scrollable='', actions='')
                  template(slot-scope='{ save, cancel }')
                    v-card-actions
                      v-btn(flat='', color="primary", @click.native='cancel()') {{api.trans('crud.cancel')}}
                      v-btn(flat='', color="primary", @click.native='save()') {{api.trans('crud.save')}}
            v-flex.text-xs-right(xs12='')
              v-btn(flat='', color="primary", @click.native='updateUser()')
                | {{api.trans('crud.save')}}  
                v-icon(color="primary") save
    // END CARD PROFILE
    // CARD RESIDENCE
    v-flex.mt-3(xs12='', sm6='', md4='')
      v-card.mx-1
        v-toolbar.text-xs-center.primary.white--text
          v-icon(dark='') home
          v-subheader.white--text
            | {{api.residence.name}}
          v-spacer
          v-btn(icon='', dark='', @click.native='editable=!editable')
            v-icon {{ editable ? 'close' : 'edit'}}
        transition(name='fadeLeft', enter-active-class='animated zoomIn', leave-active-class='animated zoomOut', mode='out-in', :duration='{ enter: 200, leave:200 }')
          v-card-text(v-if='!editable', key='normal')
            v-layout
              v-flex
                b {{api.trans('literals.status')}}
              v-flex.text-xs-right(v-bind:class="{ 'success--text': api.residence.status == 'solvent', 'danger--text': api.residence.status != 'solvent'}")
                span  {{api.trans('literals.'+ api.residence.status)}}
            br
            v-layout
              v-flex.text-xs-center
                v-progress-circular.teal--text(v-bind:size='100', v-bind:width='15', v-bind:rotate='360', v-bind:value='api.residence.debt/api.residence.total*100')
                  | {{ api.residence.debt }}
            v-layout(v-if='api.residence.owner')
              v-flex
                b {{api.trans('literals.owner')}}
              v-flex.text-xs-right
                span {{api.residence.owner.name}}
            br
            v-layout
              v-flex
                b {{api.trans('literals.number_of_people')}}
              v-flex.text-xs-right
                span {{api.residence.number_of_people}}
            br
            v-layout
              v-flex
                b {{api.trans('literals.alicuota')}}
              v-flex.text-xs-right
                span {{api.residence.alicuota}}%
            br
            v-layout
              v-flex
                b {{api.trans('literals.users')}}
              v-flex.text-xs-right
                p(v-for='user in api.residence.users', :key='user.id') {{user.name}}
          v-card-text(v-else='', key='edit')
            v-text-field(:label="api.trans('literals.name')", v-model='api.residence.name', prepend-icon='home')
            v-text-field(v-if="api.settings &&  (api.settings.owners_can_set_residents == true || api.settings.owners_can_set_residents == 'true')", :label="api.trans('literals.number_of_people')", v-model='api.residence.number_of_people', prepend-icon='people')
            v-select(v-bind:items='api.residence.users', :label="api.trans('literals.owner')", prepend-icon='person', v-model='api.residence.owner_id', item-text='name', item-value='id')
              template(slot='selection', slot-scope='data')
                v-avatar(style='display:inline')
                  img(:src='data.item.image_url')
                span
                  | {{ data.item.name }}
              template(slot='item', slot-scope='data')
                v-list-tile-avatar
                  img(v-bind:src='data.item.image_url')
                v-list-tile-content
                  v-list-tile-title(v-html='data.item.name')

            v-divider
            v-subheader {{ api.trans('literals.emergency_contact') }}
            v-text-field(:label="api.trans('literals.emergency_contact') + ' - ' +  api.trans('literals.name')", v-model='api.residence.emergency_contact.name')
            v-text-field(:label="api.trans('literals.emergency_contact') + ' - ' + api.trans('literals.phone_number')", v-model='api.residence.emergency_contact.phone_number')
            v-text-field(:label="api.trans('literals.emergency_contact') + ' - ' + api.trans('literals.email')", v-model='api.residence.emergency_contact.email')

            v-flex.text-xs-right
              v-btn(flat color="primary" @click="updateResidence()") {{api.trans('crud.save')}}
        v-card-actions(v-if="!editable")
          v-spacer
          v-btn.orange--text(flat='', to='invoices')
            v-icon.orange--text account_balance_wallet
            | {{this.api.trans('literals.invoices')}}
          v-btn.orange--text(flat='', to='documents')
            v-icon.orange--text insert_drive_file
            | {{this.api.trans('literals.dynamic_documents')}}
    // END CARD RESIDENCE
    // CARD USERS
    v-flex.mt-3(xs12='', sm6='', md4='')
      v-card.mx-1
        v-toolbar.primary.white--text(extended='')
          v-icon(dark='') people
          v-subheader.white--text {{api.trans('literals.users')}}
          v-toolbar-title.white--text(slot='extension')
            v-text-field.white--text.always-blank(v-model='query_users', prepend-icon='search', dark='', label='Search')
          template(v-if="(api.settings.limit_user == 'false' || api.settings.limit_user == 'false') ||api.residence.users.length < api.residence.number_of_people")
            v-btn.cyan.accent-2(v-if="api.settings &&  (api.settings.owners_can_create_users == true || api.settings.owners_can_create_users == 'true')" @click='addUser()', fab='', small='', bottom='', left='', absolute='')
              v-icon add
        v-card-text
          v-list
            v-list-tile(avatar='', v-for='(user,index) in filterBy(api.residence.users, query_users)', :key='user.id')
              v-list-tile-avatar(@click="askFile(user)")
                img(v-if="user.image_id", :src='user.image_url', alt='')
                v-icon.white--text.primary(v-else) add_a_photo
              v-list-tile-content
                v-list-tile-title {{user.name}}
                small {{user.email}}
              v-list-tile-action(v-if='api.residence.owner_id !== user.id && user.id !== api.user.id')
                v-btn(icon='', @click='deleteUser(user,index)')
                  v-icon delete
    // END CARD USERS
    // CARD PASSWORD
    v-flex.mt-3(xs12='', sm6='', md4='')
      v-card.mx-1
        v-card-title: h5 {{api.trans('crud.edit')}} {{api.trans('literals.password')}}
        v-card-text
          v-text-field(v-model='password', :label="api.trans('literals.password')", required='', type='password')
          v-text-field(v-model='password_confirmation', :label="api.trans('literals.password_confirmation')", type='password', required='')
          v-spacer
          v-btn(color="primary", full='', :disabled="!(password.length>5 && password === password_confirmation)", @click="updatePassword()",flat="") {{ api.trans('crud.save') }}
    // //* END PASSWORD
    // //* NEW USER DIALOG
    v-dialog(v-model='new_user', persistent='')
      v-card.mx-1
        v-card-title
          span.headline {{api.trans('crud.add')}} {{api.trans('literals.user')}}
        v-card-text
          v-text-field(v-model='user.name', :label="api.trans('literals.name')", required='')
          v-text-field(v-model='user.email', :label="api.trans('literals.email')", type='email', required='')
          v-text-field(v-model='user.document', :label="api.trans('literals.document')", type='text', required='')
          v-text-field(v-model='user.password', :label="api.trans('literals.password')", type='password', required='')
          v-select(prepend-icon='wc', v-model='user.sex', v-bind:items='genders', :label="api.trans('literals.sex')")
          v-select(prepend-icon='face', v-model='user.relationship', v-bind:items='relationships', :label="api.trans('literals.relationship')")
        v-card-actions
          v-spacer
          v-btn.blue--text.darken-1(flat='', @click.native='new_user = false') {{api.trans('crud.close')}}
          v-btn.blue--text.darken-1(:disabled='!canAdd()', flat='', @click.native='createUser()') {{api.trans('crud.add')}}
    // //* END NEW USER DIALOG
    v-snackbar(:timeout='6000', success='', top='', right='', v-model='snackbar_success')
      | {{api.trans('literals.user')}} {{api.trans('crud.updated')}}
      v-btn(dark='', icon='', @click.native='snackbar_success = false')
        v-icon close
    v-snackbar(:timeout='6000', success='', top='', right='', v-model='snackbar_success_residence')
      | {{api.trans('literals.residence')}} {{api.trans('crud.updated')}}
      v-btn(dark='', icon='', @click.native='snackbar_success_residence = false')
        v-icon close
    v-dialog(v-model="passwordResults")
      v-card
        v-card-text
          span {{passwordResultsText}}
        v-card-actions
          v-spacer
          v-btn(color="primary", @click="passwordResults=false") {{api.trans('literals.ok')}}
</template>

<script lang="coffee">
api = require('../services/api.js');
module.exports=
  name: 'Profile',
  mounted:()->
    this.api.ready
      .then (dat)=>
          if  not @api.residence.emergency_contact?
            @api.residence.emergency_contact = {
              name: ''
              phone_number : ''
              email: ''
            }
        return
  data: ->
    api: api
    genders: [ { text: api.trans('literals.male'), value: 'male' }, { text: api.trans('literals.female'), value: 'female' }, ]
    relationships: [{text: api.trans('hijo'),  value:'son'},{ text: api.trans('conyuge'),  value:'spouse'},{ text:api.trans('padre/madre'),  value:'parent'},{text:api.trans('hermano/hermana'),  value:'brother'},{text:api.trans('literals.other'), value: 'other'}]
    rules:{
      required: (value) => !!value || 'Required.',
      email: (value) =>
        pattern=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if pattern.test value
          return true
        else
          return 'Invalid e-mail.'
      document: (value) =>
        return (value > 10000 && value < 10000000000) || 'Not a valid document number'
    }
    query_users: ''
    editable: false
    snackbar_success: false
    snackbar_success_residence: false
    new_user: false
    user: { name: '', email: '', password: '', document: '', sex: 'male',relationship:'other'}
    password: ''
    password_confirmation: ''
    passwordResults: false,
    passwordResultsText: "Error"
    toImage: {}
  methods:
    updateUser: ()->
      @api.put('users/' + this.api.user.id,
        {
          name: this.api.user.name,
          email: this.api.user.email,
          document: this.api.user.document,
          sex: this.api.user.sex,
          phone_number: this.api.user.phone_number,
          birthday: this.api.user.birthday
        })
        .then (response)=>
          console.log(response.data)
          @snackbar_success = true;
          window.storage.setItem('user', JSON.stringify(@api.user));
        .catch console.error
    
    updateResidence:()->
      @api.put('residences/' + @api.user.residence_id,
        {
          name: @api.residence.name,
          number_of_people: @api.residence.number_of_people,
          owner_id: @api.residence.owner_id,
        })
        .then (response)=>
          @snackbar_success_residence = true
          owner=@api.residence.users.find (user)=>
            user.id == @api.residence.owner_id

          @api.residence.owner=owner
          window.storage.setItem('residence', JSON.stringify(@api.residence))
          @editable = false
        .catch console.error
    updatePassword:()->
      @api.post('update-password',{password: @password})
      .then (resp)=>
        @passwordResultsText=@api.trans('literals.password') + " " + @api.trans('crud.updated')
        @passwordResults=true
        console.log resp.data
      .catch (err)=> console.error err
    addUser:()->
      @new_user = true
    createUser:()->
      @api.post('users/create', @user)
        .then (response) =>
          console.log(response)
          @api.residence.users.push(response.data)
          @new_user = false
          @user = { name: '', document: '', email: '', password: '', sex: 'male' }
        .catch(console.error)
    deleteUser: (user, index)->
      return if (!confirm(api.trans('__.are you sure?')))
      @api.delete('users/' + user.id)
        .then (response) =>
          console.log(response.data)
          @api.residence.users.splice(index, 1);
          window.storage.setItem('residence', JSON.stringify(this.api.residence));
        .catch(console.error)
    canAdd:()->
      pattern=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      @user.name.length>3 && @user.document.length>3 && @user.email.length>3 && pattern.test(@user.email) && @user.password.length>6
    askFile: (user)->
      @toImage=user
      @$refs.inputImage.click()
    fileUploaded: (evt)->
      return if !evt.target.files[0]?
      reader= new FileReader()
      reader.readAsDataURL evt.target.files[0], "UTF-8"
      reader.onload= (evt)=>
        @api.upload('user',@toImage.id,evt.target.result)
        .then (resp)=>
          console.log resp.data
          @toImage.image_url = resp.data.image.url
          @toImage.image_id = resp.data.image.id
          @imageUploaded=true
          if @api.user.id == resp.data.resource.id
            @api.user.image_url = resp.data.image.url
            @api.user.image_id = resp.data.image.id
        .catch console.error
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">
.always-blank {
  color: white !important;
}
</style>

