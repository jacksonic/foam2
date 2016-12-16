<?php

/**
 * Basic wrapper for "npm run coverage".
 *
 * Only captures the log and checks the exit code. It doesn't really parse the
 * output.
 */
final class NodeTestEngine extends ArcanistUnitTestEngine {
  private $projectRoot;

  public function run() {
    $working_copy = $this->getWorkingCopy();
    $this->projectRoot = $working_copy->getProjectRoot();

    // Run the tests with coverage.
    $future = new ExecFuture('npm run coverage');
    $future->setCWD($this->projectRoot);
    list($err, $stdout, $stderr) = $future->resolve();

    $result = new ArcanistUnitTestResult();
    $result->setName("Node test engine");
    $result->setUserData($stdout);

    if ( $err ) {
      $result->setResult(ArcanistUnitTestResult::RESULT_FAIL);
    } else {
      $result->setResult(ArcanistUnitTestResult::RESULT_PASS);
    }

    // Run the documentation generator to make sure it passes.
    $future = new ExecFuture('npm run doc');
    $future->setCWD($this->projectRoot);
    list($err, $stdout, $stderr) = $future->resolve();

    $docResult = new ArcanistUnitTestResult();
    $docResult->setName("Documentation generator");
    $docResult->setUserData($stderr);

    // Doc generator sometimes exits with code 0, but emits errors.
    // Those errors include !!! so we search for that.
    if ( $err || strpos($stderr, '!!!') !== FALSE ) {
      $docResult->setResult(ArcanistUnitTestResult::RESULT_FAIL);
    } else {
      $docResult->setResult(ArcanistUnitTestResult::RESULT_PASS);
    }

    return array($result, $docResult);
  }
}

?>
