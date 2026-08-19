#include <iostream>
#include <gtest/gtest.h>

// Launch tests located under test/
int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}