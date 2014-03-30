cmake_minimum_required(VERSION 2.8)

macro(add_javascript OUTPUT_MODE OUTPUT)
  add_custom_command(
    OUTPUT ${OUTPUT}
    COMMAND python
            ${CMAKE_SOURCE_DIR}/closure-library/closure/bin/build/closurebuilder.py
            --root ${CMAKE_SOURCE_DIR}/closure-library
            --root ${CMAKE_SOURCE_DIR}/src
            --namespace befunge.Interpreter
            --output_mode ${OUTPUT_MODE}
            --compiler_jar ${CMAKE_SOURCE_DIR}/closure-library/compiler.jar
            --compiler_flags --language_in=ECMASCRIPT5
            --output_file ${OUTPUT}
    DEPENDS ${ARGN}
  )
endmacro()

set(SOURCES
  src/coord.js
  src/interpreter.js
  src/space.js
)

add_javascript(compiled ${CMAKE_BINARY_DIR}/befunge-compiled.js ${SOURCES})
add_javascript(script ${CMAKE_BINARY_DIR}/befunge-debug.js ${SOURCES})

add_custom_target(
  js ALL
  DEPENDS ${CMAKE_BINARY_DIR}/befunge-compiled.js
          ${CMAKE_BINARY_DIR}/befunge-debug.js
)
