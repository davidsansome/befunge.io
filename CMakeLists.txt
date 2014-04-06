cmake_minimum_required(VERSION 2.8)

macro(add_javascript OUTPUT_MODE OUTPUT)
  add_custom_command(
    OUTPUT ${OUTPUT}
    COMMAND python
            ${CMAKE_SOURCE_DIR}/closure-library/closure/bin/build/closurebuilder.py
            --root ${CMAKE_SOURCE_DIR}/closure-library
            --root ${CMAKE_SOURCE_DIR}/src
            --namespace befunge.Interpreter
            --namespace befunge.Renderer
            --output_mode ${OUTPUT_MODE}
            --compiler_jar ${CMAKE_SOURCE_DIR}/closure-library/compiler.jar
            --compiler_flags --language_in=ECMASCRIPT5
            --compiler_flags --warning_level=VERBOSE
            --output_file ${OUTPUT}
    DEPENDS ${ARGN}
  )
endmacro()

macro(add_javascript_deps OUTPUT)
  add_custom_command(
    OUTPUT ${OUTPUT}
    COMMAND python
            ${CMAKE_SOURCE_DIR}/closure-library/closure/bin/calcdeps.py
            --path ${CMAKE_SOURCE_DIR}/src
            --dep ${CMAKE_SOURCE_DIR}/closure-library
            --output_mode deps
            --compiler_jar ${CMAKE_SOURCE_DIR}/closure-library/compiler.jar
            --compiler_flags --language_in=ECMASCRIPT5
            --compiler_flags --warning_level=VERBOSE
            --output_file ${OUTPUT}
    DEPENDS ${ARGN}
  )
endmacro()

set(SOURCES
  src/coord.js
  src/events.js
  src/interpreter.js
  src/renderer.js
  src/space.js
  src/threadcontext.js
  src/uihandler.js
)

add_javascript(compiled ${CMAKE_BINARY_DIR}/befunge-compiled.js ${SOURCES})
add_javascript(script ${CMAKE_BINARY_DIR}/befunge-debug.js ${SOURCES})
add_javascript_deps(${CMAKE_BINARY_DIR}/befunge-deps.js ${SOURCES})

add_custom_target(
  js ALL
  DEPENDS ${CMAKE_BINARY_DIR}/befunge-compiled.js
          ${CMAKE_BINARY_DIR}/befunge-debug.js
          ${CMAKE_BINARY_DIR}/befunge-deps.js
)

add_custom_target(
  debugjs
  DEPENDS ${CMAKE_BINARY_DIR}/befunge-debug.js
)
