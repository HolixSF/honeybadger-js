# Honeybadger Client-Side Javascript Library

[![Build
Status](https://travis-ci.org/honeybadger-io/honeybadger-js.png?branch=master&1)](https://travis-ci.org/honeybadger-io/honeybadger-js)

A client-side JavaScript library for integrating apps with the :zap: [Honeybadger Error Notifier](http://honeybadger.io). For server-side javascript, check out our [NodeJS library](https://github.com/honeybadger-io/honeybadger-node).

*Note: 0.1 and 0.2 make significant improvements to error grouping. As a result,
new errors may be grouped differently than old.*

## Getting Started

### 1. Include the JS library

Place the following code between the `<head></head>` tags of your page:

```html
<script src="//js.honeybadger.io/v0.3/honeybadger.min.js" type="text/javascript"></script>
<script type="text/javascript">
  Honeybadger.configure({
    api_key: 'project api key',
    environment: 'production'
  });
</script>
```

### 2. Set your API key

You can get the API key for a specific Honeybadger project from the Project Settings page. Then set it as a configuration option.

```javascript
Honeybadger.configure({
  api_key: '[YOUR API KEY HERE]'
});
```

### 3. Start reporting exceptions

To catch an error and notify Honeybadger:

```javascript
try {
  // ...error producing code...
} catch(e) {
  Honeybadger.notify(e);
}
```

JavaScript often uses generic class names -- such as `Error` -- which are uninformative and also cause unrelated errors to be grouped together. To get around this issue it's a good practice to send a custom error class when notifying Honeybadger:

```javascript
try {
  // ...error producing code...
} catch(e) {
  Honeybadger.notify(e, 'DescriptiveClass');
}
```


## Advanced Configuration

You can set configuration options by using the `Honeybadger.configure` function. All of the available options are shown below:

```javascript
Honeybadger.configure({
  // Honeybadger API key (required)
  api_key: '',

  // Collector Host
  host: 'api.honeybadger.io',

  // Use SSL?
  ssl: true,

  // Project root
  project_root: 'http://my-app.com',

  // Environment
  environment: 'production',

  // Component (optional)
  component: '',

  // Action (optional)
  action: '',

  // Should unhandled (window.onerror) notifications be sent?
  onerror: false,

  // Disable notifications?
  disabled: false,

  // Timeout (in milliseconds) when making requests.
  timeout: false
});
```

You can call `Honeybadger.configure` as many times as you like. The existing configuration data will be merged with any new data you provide. This is especially useful for changing the `action` and `component` values inside of single-page apps.



## Public Interface 

### `Honeybadger.notify()`: Send an exception to Honeybadger

If you've caught an exception and want to send it to Honeybadger, this is the method for you. 

#### Examples:

```javascript
try {
  // ...error producing code...
} catch(e) {
  Honeybadger.notify(e, 'DescriptiveClass');
}
```
---

### `Honeybadger.wrap()`: Wrap the given function in try/catch and report any exceptions

It can be a pain to include try/catch blocks everywhere in your app. A slighly nicer option is to use `Honeybadger.wrap`. You pass it a function. It returns a new function which wraps your existing function is a try/catch block.

#### Examples:

```javascript
Honeybadger.wrap(function(){
  throw "oops";
})();
```

You can also omit the () on the end (which immediately calls the returned function) and use it to wrap your callbacks, like so:

```javascript
$(document).on("click", "#myElement", Honeybadger.wrap(function(){ throw "oops"; }));
```



### `Honeybadger.setContext()`: Set metadata to be sent if an exception occurs

Javascript exceptions are pretty bare-bones. You probably have some additonal data that could make them a lot easier to understand. Perhaps the name of the current Angular view, or the id of the current user. This function lets you set context data that will be sent if an error should occur. 

You can call `setContext` as many times as you like. New context data will be merged with an existing data. 

#### Examples:

```javascript
// On load
Honeybadger.setContext({
  user_id: 123
});

// Later
Honeybadger.setContext({
  backbone_view: 'tracks'
});

// The context now contains { user_id: 123, backbone_view: 'tracks' }
```
---

### `Honeybadger.resetContext()`: Clear context metadata

If you've used `Honeybadger.setContext` to store context data, you can clear it with `Honeybadger.resetContext`.

#### Example:

```javascript
// Set the context to {}
Honeybadger.resetContext();

// Set the context to { user_id: 123 }
Honeybadger.resetContext({
  user_id: 123
});
```

---

### `Honeybadger.beforeNotify()`: Add a callback to be run before an exception is reported

Passing a function to `Honeybadger.beforeNotify` will add the function
to a list of before notify handlers. If the function includes a
parameter, the `Notice` object will be passed as an argument.  Multiple
handlers may be added in this fashion:


#### Examples

```javascript
Honeybadger.beforeNotify(function(notice) {
  notice.message = 'My custom message';
});


// To halt notification, return false from any `beforeNotify` handler:
Honeybadger.beforeNotify(function(notice) {
  if (notice.class == 'MyCustomError') return false;
});
```

The following notice attributes may be modified by your notification handlers:

* stack - The stack trace
* class - The exception class name
* message - The error message
* url - The current url
* project_root - The root url
* environment - Name of the environment. example: "production"
* component - Similar to a rails controller name. example: "users"
* action - Similar to a rails action name. example: "create"
* fingerprint - A unique fingerprint, used to customize grouping of errors in Honeybadger.
* context - The context object.


---


### `Honeybadger.configure()`: Set configuration values

The `configure` method takes an object containing config values. Its return value is unspecified. 

#### Examples:

```javascript
Honeybadger.configure({api_key: "adlkjfljk"});
```

## Sourcemaps

Honeybadger can automatically un-minify your code if you provide a [sourcemap](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) along with your minified JavaScript files.

In order to make this work you must include a special comment at the bottom of your minified file which points to the corresponding sourcemap file. To see what this comment should look like, [see the comment at the bottom of honeybadger.js](https://js.honeybadger.io/v0.3/honeybadger.min.js). If you upload the original source files along with the sourcemap, Honeybadger will link to those files when displaying the stack trace.

All files must be publically accessible online so that Honeybadger's servers can download and parse them. For the full specification, see the [Source Map Revision 3 Proposal](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit).

### Linking stack traces to source files

Honeybadger supports an optional `sourceRoot` comment, which should point to the root path of the original source files online. For example:

```js
// ...minified code...
//# sourceMappingURL=application.min.js.map
//# sourceRoot=https://sources.my-domain.com/src
```

This option may also be specified as a top-level key in the JSON sourcemap file itself:

```js
{
  "sourceRoot" : "https://sources.my-domain.com/src",
  // ...sourcemap...
}
```

To customize this setting *just* for Honeybadger, use `honeybadgerSourceRoot` instead.

#### Linking stack traces to GitHub

If you're using the GitHub integration, you can also link to source files on GitHub by substituting a special `[PROJECT_ROOT]` token for the root of your GitHub repository:

```js
// ...minified code...
//# sourceMappingURL=honeybadger.min.js.map
//# honeybadgerSourceRoot=[PROJECT_ROOT]/src
```

This is the only situation in which the source root is not required to be a valid URL.

## Unhandled errors via (window.onerror)

By default, honeybadger.js does not track unhandled errors. This is
because `window.onerror` is a very limited method of error handling, and
does not usually yield useful information. It is our official
recommendation to always use try/catch explicitly to notify Honeybadger.
If you still want to automatically catch errors via `window.onerror`,
you can set the `onerror` configuration option to true:

```javascript
Honeybadger.configure({
  api_key: 'project api key',
  onerror: true
});
```


## Contributing

1. Fork it.
2. Create a topic branch `git checkout -b my_branch`
3. Commit your changes `git commit -am "Boom"`
3. Push to your branch `git push origin my_branch`
4. Send a [pull request](https://github.com/honeybadger-io/honeybadger-js/pulls)

### Running the tests

To run the test suite, enter `make test` into the console. 

### License

The Honeybadger gem is MIT licensed. See the [MIT-LICENSE](https://raw.github.com/honeybadger-io/honeybadger-js/master/MIT-LICENSE) file in this repository for details. 

