<template>
	<v-container fluid>
	
		<v-layout wrap>
			<!--//* CARD PROFILE  -->
			<v-flex xs12 sm6 md4>
				<v-card>
					<v-card-media src=" https://ak2.picdn.net/shutterstock/videos/23151772/thumb/1.jpg " height="150px" class="white--text">
						<v-container fill-height fluid>
							<v-layout fill-height wrap>
								<v-flex xs12 align-center flexbox>
									<img :src="api.user.image_url" class="avatar medium">
								</v-flex>
								<v-flex xs12 align-end flexbox>
									<span class="headline">{{api.user.name}}</span>
								</v-flex>
							</v-layout>
						</v-container>
					</v-card-media>
					<v-card-text style="height: 1px; position: relative">
						<v-btn absolute small dark fab top right class="pink" @click.native="updateUser()">
							<v-icon>save</v-icon>
						</v-btn>
						<v-subheader class="grey--text text--lighten-1">Profile</v-subheader>
					</v-card-text>
					<v-card-title>
						<v-layout row wrap>
							<v-flex xs12 style="width:100%">
								<v-text-field prepend-icon="account_circle" type="text" v-model="api.user.name" :label="api.trans('literals.name')" :rules="[rules.required]"></v-text-field>
							</v-flex>
							<v-flex xs12 style="width:100%">
								<v-text-field prepend-icon="email" type="email" v-model="api.user.email" :label="api.trans('literals.email')" :rules="[rules.required,rules.email]"></v-text-field>
							</v-flex>
							<v-flex xs12 style="width:100%">
								<v-text-field prepend-icon="card_membership" type="number" v-model="api.user.document" :label="api.trans('literals.document')" :rules="[rules.document]" min="1000" max="1000000000"></v-text-field>
							</v-flex>
							<v-flex xs12 style="width:100%">
								<v-text-field prepend-icon="phone" type="number" v-model="api.user.phone_number" :label="api.trans('literals.phone_number')"></v-text-field>
							</v-flex>
							<v-flex xs12 style="width:100%">
								<v-select prepend-icon="wc" v-model="api.user.sex" v-bind:items="genders" :label="api.trans('literals.sex')"></v-select>
							</v-flex>
							<v-flex xs12 style="width:100%">
								<v-menu lazy :close-on-content-click="true" transition="scale-transition" offset-y full-width :nudge-left="40" max-width="290px">
									<v-text-field slot="activator" :label="api.trans('literals.birthday')" v-model="api.user.birthday" prepend-icon="event" readonly></v-text-field>
									<v-date-picker v-model="api.user.birthday" scrollable actions>
										<template scope="{ save, cancel }">
											<v-card-actions>
												<v-btn flat primary @click.native="cancel()">{{api.trans('crud.cancel')}}</v-btn>
												<v-btn flat primary @click.native="save()">{{api.trans('crud.save')}}</v-btn>
											</v-card-actions>
										</template>
									</v-date-picker>
								</v-menu>
							</v-flex>
							<v-flex xs12 class="text-xs-right">
								<v-btn flat primary @click.native="updateUser()">
									{{api.trans('crud.save')}} &nbsp;
									<v-icon primary>save</v-icon>
								</v-btn>
							</v-flex>
	
						</v-layout>
					</v-card-title>
				</v-card>
			</v-flex>
			<!--//* END CARD PROFILE  -->
	
			<!--//* CARD RESIDENCE  -->
			<v-flex xs12 sm6 md4>
				<v-card>
					<v-toolbar class="text-xs-center primary white--text">
						<v-icon dark>home</v-icon>
						<v-subheader class="white--text">{{api.residence.name}}
						</v-subheader>
						<v-spacer></v-spacer>
						<v-btn icon dark @click.native="editable=!editable">
							<v-icon>{{ editable ? 'close' : 'edit'}}</v-icon>
						</v-btn>
					</v-toolbar>
	
					<transition name="fadeLeft" enter-active-class="animated zoomIn" leave-active-class="animated zoomOut" mode="out-in" :duration="{ enter: 200, leave:200 }">
	
						<v-card-text v-if="!editable" key="normal">
							<v-layout>
								<v-flex>
									<b>{{api.trans('literals.status')}}</b>
								</v-flex>
								<v-flex class="text-xs-right" v-bind:class="{ 'success--text': api.residence.status == 'solvent', 'danger--text': api.residence.status != 'solvent'}">
									<span> {{api.trans('literals.'+ api.residence.status)}}</span>
								</v-flex>
							</v-layout>
							<br>
							<v-layout>
								<v-flex class="text-xs-center">
									<v-progress-circular v-bind:size="100" v-bind:width="15" v-bind:rotate="360" v-bind:value="api.residence.debt/api.residence.total*100" class="teal--text">
										{{ api.residence.debt }}
									</v-progress-circular>
								</v-flex>
							</v-layout>
	
							<v-layout v-if="api.residence.owner">
								<v-flex>
									<b>{{api.trans('literals.owner')}}</b>
								</v-flex>
								<v-flex class="text-xs-right">
									<span>{{api.residence.owner.name}}</span>
								</v-flex>
							</v-layout>
	
							<br>
							<v-layout>
								<v-flex>
									<b>{{api.trans('literals.number_of_people')}}</b>
								</v-flex>
								<v-flex class="text-xs-right">
									<span>{{api.residence.number_of_people}}</span>
								</v-flex>
							</v-layout>
	
							<br>
							<v-layout>
								<v-flex>
									<b>{{api.trans('literals.alicuota')}}</b>
								</v-flex>
								<v-flex class="text-xs-right">
									<span>{{api.residence.alicuota}}%</span>
								</v-flex>
							</v-layout>
	
							<br>
							<v-layout>
								<v-flex>
									<b>{{api.trans('literals.users')}}</b>
								</v-flex>
								<v-flex class="text-xs-right">
									<p v-for="user in api.residence.users" :key="user.id">{{user.name}}</p>
								</v-flex>
							</v-layout>
						</v-card-text>
	
						<v-card-text v-else key="edit">
							<v-text-field :label="api.trans('literals.name')" v-model="api.residence.name" prepend-icon="home"></v-text-field>
							<v-text-field :label="api.trans('literals.number_of_people')" v-model="api.residence.number_of_people" prepend-icon="people"></v-text-field>
							<v-select v-bind:items="api.residence.users" :label="api.trans('literals.owner')" prepend-icon="person" v-model="api.residence.owner_id" item-text="name" item-value="id">
								<template slot="selection" scope="data">
									<v-avatar style="display:inline">
										<img :src="data.item.image_url">
									</v-avatar>
									<span>
										{{ data.item.name }}
									</span>
								</template>
								<template slot="item" scope="data">
									<v-list-tile-avatar>
										<img v-bind:src="data.item.image_url" />
									</v-list-tile-avatar>
									<v-list-tile-content>
										<v-list-tile-title v-html="data.item.name"></v-list-tile-title>
									</v-list-tile-content>
								</template>
							</v-select>
							<v-flex class="text-xs-right">
								<v-btn primary flat @click.native="updateResidence()">
									<v-icon class="primary--text">save</v-icon>
									&nbsp;
									<span>{{api.trans('crud.save')}}</span>
								</v-btn>
							</v-flex>
						</v-card-text>
	
					</transition>
	
					<v-card-actions v-if="!editable">
						<v-btn flat class="primary--text" @click.native="editable=!editable">
							<v-icon primary>edit</v-icon>
							{{api.trans('crud.edit')}}
						</v-btn>
						<v-spacer></v-spacer>
						<v-btn flat class="pink--text" to="invoices">
							<v-icon class="pink--text">account_balance_wallet</v-icon>
							{{this.api.trans('literals.invoices')}}
						</v-btn>
						<v-btn flat class="pink--text" to="documents">
							<v-icon class="pink--text">insert_drive_file</v-icon>
							{{this.api.trans('literals.dynamic_documents')}}
						</v-btn>
					</v-card-actions>
	
				</v-card>
			</v-flex>
			<!--//* END CARD RESIDENCE  -->
	
			<!--//* CARD USERS  -->
			<v-flex xs12 sm6 md4>
				<v-card>
					<v-toolbar class="primary white--text" extended>
						<v-icon dark>people</v-icon>
						<v-subheader class="white--text">{{api.trans('literals.users')}}</v-subheader>
	
						<v-toolbar-title slot="extension" class="white--text">
							<v-text-field v-model="query_users" prepend-icon="search" dark class="white--text always-blank" label="Search"></v-text-field>
						</v-toolbar-title>
						<v-btn @click="addUser()" fab small class="cyan accent-2" bottom left absolute>
							<v-icon>add</v-icon>
						</v-btn>
					</v-toolbar>
					<v-card-text>
						<v-list>
							<v-list-tile avatar v-for="(user,index) in filterBy(api.residence.users, query_users)" :key="user.id">
								<v-list-tile-avatar>
									<img :src="user.image_url" alt="">
								</v-list-tile-avatar>
								<v-list-tile-content>
									<v-list-tile-title>{{user.name}}</v-list-tile-title>
									<small>{{user.email}}</small>
								</v-list-tile-content>
								<v-list-tile-action v-if="api.residence.owner_id !== user.id && user.id !== api.user.id">
									<v-btn icon @click="deleteUser(user,index)">
										<v-icon>delete</v-icon>
									</v-btn>
								</v-list-tile-action>
							</v-list-tile>
						</v-list>
					</v-card-text>
				</v-card>
			</v-flex>
			<!--//* END CARD USERS  -->
	
			<!--//* NEW USER DIALOG  -->
			<v-dialog v-model="new_user" persistent>
				<v-card>
					<v-card-title>
						<span class="headline">{{api.trans('crud.add')}} {{api.trans('literals.user')}}</span>
					</v-card-title>
					<v-card-text>
						<v-text-field v-model="user.name" :label="api.trans('literals.name')" required></v-text-field>
	
						<v-text-field v-model="user.email" :label="api.trans('literals.email')" type="email" required></v-text-field>
	
						<v-text-field v-model="user.document" :label="api.trans('literals.document')" type="text" required></v-text-field>
	
						<v-text-field v-model="user.password" :label="api.trans('literals.password')" type="password" required></v-text-field>
	
						<v-select prepend-icon="wc" v-model="user.sex" v-bind:items="genders" :label="api.trans('literals.sex')"></v-select>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn class="blue--text darken-1" flat @click.native="new_user = false">{{api.trans('crud.close')}}</v-btn>
						<v-btn :disabled="!canAdd()" class="blue--text darken-1" flat @click.native="createUser()">{{api.trans('crud.add')}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
			<!--//* END NEW USER DIALOG  -->
	
			<v-snackbar :timeout="6000" success top right v-model="snackbar_success">
				{{api.trans('literals.user')}} {{api.trans('crud.updated')}}
				<v-btn dark icon @click.native="snackbar_success = false">
					<v-icon>close</v-icon>
				</v-btn>
			</v-snackbar>
	
			<v-snackbar :timeout="6000" success top right v-model="snackbar_success_residence">
				{{api.trans('literals.residence')}} {{api.trans('crud.updated')}}
				<v-btn dark icon @click.native="snackbar_success = false">
					<v-icon>close</v-icon>
				</v-btn>
			</v-snackbar>
	
		</v-layout>
	</v-container>
</template>

<script>
var api = require('../services/api.js');
export default {
	name: 'Profile',
	mounted() {
		this.api.ready
			.then((dat) => {
			})
	},
	data() {
		return {
			api: api,
			genders: [
				{ text: 'Male', value: 'male' },
				{ text: 'Female', value: 'female' },
			],
			rules: {
				required: (value) => !!value || 'Required.',
				email: (value) => {
					const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
					return pattern.test(value) || 'Invalid e-mail.'
				},
				document: (value) => {
					return (value > 10000 && value < 10000000000) || 'Not a valid document number'
				},
			},
			query_users: '',
			editable: false,
			snackbar_success: false,
			snackbar_success_residence: false,
			new_user: false,
			user: {
				name: '',
				email: '',
				password: '',
				document: '',
				sex: 'male',
			}
		}
	},
	methods: {
		updateUser: function () {
			this.api.put('users/' + this.api.user.id,
				{
					name: this.api.user.name,
					email: this.api.user.email,
					document: this.api.user.document,
					sex: this.api.user.sex,
					phone_number: this.api.user.phone_number,
					birthday: this.api.user.birthday
				})
				.then((response) => {
					console.log(response.data)
					this.snackbar_success = true;
					window.localStorage.setItem('user', JSON.stringify(this.api.user));
				})
				.catch(console.error);
		},
		updateResidence: function () {
			this.api.put('residences/' + this.api.user.residence_id,
				{
					name: this.api.residence.name,
					number_of_people: this.api.residence.number_of_people,
					owner_id: this.api.residence.owner_id,
				})
				.then((response) => {
					this.snackbar_success_residence = true;
					var owner = this.api.residence.users.find((user) => {
						return user.id == this.api.residence.owner_id
					});
					this.api.residence.owner = owner;
					window.localStorage.setItem('residence', JSON.stringify(this.api.residence));
					this.editable = false;
				})
				.catch(console.error);
		},
		addUser: function () {
			this.new_user = true
		},
		createUser: function () {
			this.api.post('users/create', this.user)
				.then((response) => {
					console.log(response)
					this.api.residence.users.push(response.data)
					this.new_user = false
					this.api.user = { name: '', document: '', email: '', password: '', sex: 'male' }
					window.localStorage.setItem('residence', JSON.stringify(this.api.residence));
				})
				.catch(console.error)
		},
		deleteUser: function (user, index) {
			if (!confirm(api.trans('__.are you sure?'))) return
			this.api.delete('users/' + user.id)
				.then((response) => {
					console.log(response.data)
					this.api.residence.users.splice(index, 1);
					window.localStorage.setItem('residence', JSON.stringify(this.api.residence));
				})
				.catch(console.error)
		},
		canAdd: function () {
			var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return this.user.name.length > 3 &&
				this.user.document.length > 3 &&
				this.user.email.length > 3 &&
				pattern.test(this.user.email) &&
				this.user.password.length > 6
		}
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">
  .always-blank
    color white !important
</style>

