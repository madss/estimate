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

    sum: function(property) {
      var sum = 0;
      this.forEach(function(task) {
        sum += task.get(property);
      });
      return sum;
    },

    best: function() {
      return this.sum('best');
    }.property('@each.best'),

    likely: function() {
      return this.sum('likely');
    }.property('@each.likely'),

    worst: function() {
      return this.sum('worst');
    }.property('@each.worst'),

    estimate: function() {
      return this.sum('estimate');
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

  // -------------------------------------------------------------------
  // Estimate collection
  // -------------------------------------------------------------------
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
  });
  App.MainView.create().appendTo("#content");

  // -------------------------------------------------------------------
  // Create Task View
  // -------------------------------------------------------------------
  App.CreateTaskView = Em.View.extend({
    tagName: "table",
    task: Em.Object.create({
      description: '',
      best:   1,
      likely: 2,
      worst:  3
    }),

    add: function() {
      var task = App.Task.create({
        description: this.task.get('description'),
        best: parseFloat(this.task.get('best')),
        likely: parseFloat(this.task.get('likely')),
        worst: parseFloat(this.task.get('worst'))
      });
      if (task.description != '' && task.best && task.likely && task.worst) {
        App.tasks.pushObject(task);
        this.task.set('description', '');
        $('#description').focus();
      }
    },

    TextField: Em.TextField.extend(Em.TargetActionSupport, {
      target: 'parentView',
      action: 'add',
      insertNewline: function() {
        this.triggerAction();
      }
    })
  });

  // -------------------------------------------------------------------
  // Task View
  // -------------------------------------------------------------------
  App.TaskView = Em.View.extend({
    tagName: 'tr',
    editing: false,

    edit: function() {
      this.set('editing', true);
      this.updatedTask = Em.Object.create({
        description: this.task.get('description'),
        best:   this.task.get('best'),
        likely: this.task.get('likely'),
        worst:  this.task.get('worst')
      });
    },

    update: function() {
      this.set('editing', false);
      var description = this.updatedTask.get('description');
      var best   = parseFloat(this.updatedTask.get('best'));
      var likely = parseFloat(this.updatedTask.get('likely'));
      var worst  = parseFloat(this.updatedTask.get('worst'));
      if (description != '' && best && likely && worst) {
        this.task.set('description', description);
        this.task.set('best',   best);
        this.task.set('likely', likely);
        this.task.set('worst',  worst);
        this.set('editing', false);
      }
    },

    cancel: function() {
      this.set('editing', false);
    },

    remove: function() {
      App.tasks.removeObject(this.get("task"));
    },

    TextField: Em.TextField.extend(Em.TargetActionSupport, {
      target: 'parentView',
      action: 'update',
      insertNewline: function() {
        this.triggerAction();
      }
    })
  });

  // -------------------------------------------------------------------
  // View helpers
  // -------------------------------------------------------------------
  Handlebars.registerHelper('fixed', function(property) {
    var value = Ember.getPath(this, property);
    return value.toFixed(2);
  });
});
