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
 * List of all FOAM files available to be loaded in a JSONP
 * format, so it can used from both nodejs scripts, and web
 * pages via script tags easily.
 */

FOAM_FILES([

  { name: "foam/core/lib" },
  { name: "foam/core/context" },
  { name: "foam/core/stdlib" },
  { name: "foam/core/Boot" },
  { name: "foam/core/FObject" },
  { name: "foam/core/Model" },
  { name: "foam/core/Property" },
  { name: "foam/core/Method" },
  { name: "foam/core/phase2" },
  { name: "foam/core/property/AxiomArray" },
  { name: "foam/core/property/PropertyArray" },
  { name: "foam/core/EndBoot" },
  { name: "foam/core/Slot" },
  { name: "foam/core/property/Boolean" },
  { name: "foam/core/property/Int" },
  { name: "foam/core/Constant" },
  { name: "foam/core/InnerClass" },
  { name: "foam/core/ImportsExports" },
  { name: "foam/core/Requires" },
  { name: "foam/core/Window" },
  { name: "foam/core/property/String" },
  { name: "foam/core/property/StringArray" },
  { name: "foam/core/Listener" },
  { name: "foam/core/property/FObjectArray" },
  { name: "foam/core/Argument" },
  { name: "foam/core/debug" },
  { name: "foam/core/Topic" },
  { name: "foam/core/Interface" },
  { name: "foam/core/Implements" },
  { name: "foam/dao/Sink" },
  { name: "foam/dao/DAO" },
  { name: "foam/dao/ArraySink" },
  { name: "foam/dao/ArrayDAO" },
  { name: "foam/core/async" },
  { name: "foam/core/property/Unsafe" },
  { name: "foam/pattern/Singleton" },


]);
