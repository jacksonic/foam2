/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A Sink is a destination for results retrieved from a DAO by
 * <tt>select()</tt>. The DAO will call <tt>sink.put(obj)</tt> for each
 * <tt>obj</tt> in the query. When all the results have been sent, it calls
 * <tt>eof()</tt>.
 */
foam.INTERFACE({
  package: 'foam.dao',
  name: 'Sink',

  methods: [
    {
      /** Called by <tt>DAO.select()</tt> for each object in the DAO. */
      name: 'put',
      returns: '',
      args: [
        {
          name: 'obj',
        }
      ],
      code: function() {}
    },
    {
      /**
       * Called by <tt>DAO.removeAll()</tt> for each object removed from the
       * DAO.
       */
      name: 'remove',
      returns: '',
      args: [
        {
          name: 'obj',
        }
      ],
      code: function() {}
    },
    {
      /**
       * Called by <tt>DAO.select()</tt> and <tt>DAO.removeAll()</tt> after all
       * objects have been sent to <tt>put()</tt> or <tt>remove()</tt>,
       * respectively.
       */
      name: 'eof',
      returns: '',
      args: [],
      code: function() {}
    },
    {
      /**
       * Called by the DAO if there's an error, such as insufficient
       * credentials.
       */
      name: 'error',
      returns: '',
      args: [
        {
          name: 'err'
        }
      ],
      code: function() {}
    },
    {
      /**
       * Called by the DAO if the DAO changes drastically. For example, if a new
       * sync comes from the network, or a ProxyDAO's inner DAO is replaced.
       *
       * It signals that any caches, views or other objects based on the
       * contents of a DAO need to be discarded and rebuilt.
       */
      name: 'reset',
      returns: '',
      args: [],
      code: function() {}
    }
  ]
});

