$(function() {
  var App = Em.Application.create();
  window.App = App;

  // -------------------------------------------------------------------
  // Task model
  // -------------------------------------------------------------------
  App.Task = Em.Object.extend({
    description: "",
    best:   0.0,
    likely: 0.0,
    worst:  0.0,

    estimate: function() {
      var b = this.get('best');
      var l = this.get('likely');
      var w = this.get('worst');
      return (b + 4*l + w)/6;
    }.property('best', 'likely', 'worst'),

    deviation: function() {
      var b = this.get('best');
      var w = this.get('worst');
      return (w - b)/6;
    }.property('best', 'worst')
  });

  // -------------------------------------------------------------------
  // Task collection
  // -------------------------------------------------------------------
  App.tasks = Em.ArrayProxy.create({
    content: [],

    best: function() {
      var sum = 0;
      this.forEach(function(task) {
        sum += task.get('best');
      });
      return sum;
    }.property('@each.best'),

    likely: function() {
      var sum = 0;
      this.forEach(function(task) {
        sum += task.get('likely');
      });
      return sum;
    }.property('@each.likely'),

    worst: function() {
      var sum = 0;
      this.forEach(function(task) {
        sum += task.get('worst');
      });
      return sum;
    }.property('@each.worst'),

    estimate: function() {
      var sum = 0;
      this.forEach(function(task) {
        sum += task.get('estimate');
      });
      return sum;
    }.property('@each.estimate'),

    deviation: function() {
      var squareSum = 0;
      this.forEach(function(task) {
        var d = task.get('deviation');
        squareSum += d*d;
      });
      return Math.sqrt(squareSum);
    }.property('@each.deviation')
  });

  // -------------------------------------------------------------------
  // Estimate model
  // -------------------------------------------------------------------
  App.Estimate = Em.Object.extend({
    certainty: 0.0,
    factor: 0.0,
    estimate: function() {
      var estimate  = App.tasks.get('estimate');
      var deviation = App.tasks.get('deviation');
      var factor    = this.get('factor');
      return estimate + factor*deviation;
    }.property('factor', 'App.tasks.estimate', 'App.tasks.deviation')
  });

  App.estimates = Em.ArrayProxy.create({
    content: [
      App.Estimate.create({
        certainty: 50.0,
        factor:    0.0
      }),
      App.Estimate.create({
        certainty: 85.0,
        factor:    1.0
      }),
      App.Estimate.create({
        certainty: 95.0,
        factor:    1.654
      }),
      App.Estimate.create({
        certainty: 98.0,
        factor:    2.0
      }),
      App.Estimate.create({
        certainty: 99.9,
        factor:    3.0
      }),
    ]
  });
  
  // -------------------------------------------------------------------
  // Main View
  // -------------------------------------------------------------------
  App.MainView = Em.View.extend({
    templateName: "main-view",

    add: function(event) {
      //if (event.keyCode != 13) return;
      var task = App.Task.create({
        description: $('#description').val(),
        best: parseFloat($('#best').val()),
        likely: parseFloat($('#likely').val()),
        worst: parseFloat($('#worst').val())
      });
      App.tasks.pushObject(task);
    }
  });

  App.TaskView = Em.View.extend({
    tagName: 'tr',

    remove: function() {
      App.tasks.removeObject(this.get("task"));
    }
  });

  App.MainView.create().appendTo("#content");

  // -------------------------------------------------------------------
  // View helpers
  // -------------------------------------------------------------------
  Handlebars.registerHelper('fixed', function(property) {
    var value = Ember.getPath(this, property);
    return value.toFixed(2);
  });
});
