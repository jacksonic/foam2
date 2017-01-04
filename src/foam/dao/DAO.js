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

// FUTURE: A more complete tutorial on the DAO interface is needed.

/**
 * Interface for DAOs - Data Access Objects.
 *
 * A DAO is a collection of objects, with the basic CRUD operations:
 *
 * <ul>
 * <li><tt>put()</tt> for new items and updates to existing ones
 * <li><tt>find()</tt> to retrieve a single item by its ID.
 * <li><tt>select()</tt> to retrieve many items
 * <li><tt>remove()</tt> to delete a single item
 * <li><tt>removeAll()</tt> to delete many items
 * </ul>
 *
 * These basic operations can also be filtered using <tt>where()</tt>,
 * <tt>skip()</tt>, <tt>limit()</tt> and <tt>orderBy()</tt>.
 *
 */
foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAO',

  methods: [
    {
      /**
       * Updates an existing item, or adds a new one.
       *
       * Might edit the incoming item, for example by filling in the ID.
       *
       * Returns a Promise for the updated object.
       */
      name: 'put',
      returns: 'Promise',
      args: [
        {
          name: 'obj',
          typeName: 'foam.core.FObject'
        }
      ]
    },
    {
      /**
       * Removes an object if it exists. Succeeds but does nothing if that
       * object was already not in the DAO.
       *
       * Returns an empty Promise.
       */
      name: 'remove',
      returns: 'Promise',
      args: [
        {
          name: 'obj',
          typeName: 'foam.core.FObject'
        }
      ]
    },
    {
      /**
       * Finds a single item by its ID and returns it in a Promise.
       *
       * If no item with that ID exists, the Promise resolves successfully with
       * a value of null.
       */
      name: 'find',
      returns: 'Promise',
      args: [
        {
          name: 'id',
          typeName: 'any'
        }
      ]
    },
    {
      /**
       * Retrieves 0 or more items from the DAO. The first argument is a
       * <tt>foam.dao.Sink</tt>, which receives the items from the DAO.
       *
       * <tt>select()</tt> will call <tt>sink.put(obj)</tt> for each
       * <tt>obj</tt> in the DAO, then call <tt>sink.eof()</tt>.
       *
       * Returns a Promise, whose value is the <tt>sink</tt>.
       */
      name: 'select',
      returns: 'Promise',
      // FUTURE: Bring back the other arguments, once they're supported.
      args: [
        {
          /**
           * Sink to send the results to.
           *
           * Optional. DAOs should construct an ArraySink if no sink is
           * provided.
           */
          name: 'sink',
          typeName: 'foam.dao.Sink='
        }
      ]
    },
    {
      /**
       * Removes all items from the DAO. Returns a Promise that resolves with no
       * value when the operation is complete.
       */
      name: 'removeAll',
      returns: 'Promise',
      args: []
    }
  ]
});
