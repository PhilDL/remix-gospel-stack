export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce throwing redirect() instead of returning it",
      category: "Best Practices",
      recommended: true,
    },
    schema: [], // no options
    messages: {
      useThrow:
        "redirect() should be thrown, not returned. Use 'throw redirect(...)' instead of 'return redirect(...)'",
    },
  },

  create(context) {
    return {
      // Look for return statements
      ReturnStatement(node) {
        // Check if the returned expression is a call to redirect()
        if (
          node.argument &&
          node.argument.type === "CallExpression" &&
          node.argument.callee.type === "Identifier" &&
          node.argument.callee.name === "redirect"
        ) {
          context.report({
            node,
            messageId: "useThrow",
          });
        }
      },

      // Additionally check for imported redirect
      ImportDeclaration(node) {
        // Verify this is importing from react-router
        if (node.source.value !== "react-router") {
          return;
        }

        // Check if redirect is being imported
        const redirectImport = node.specifiers.find(
          (specifier) =>
            specifier.type === "ImportSpecifier" &&
            specifier.imported.name === "redirect",
        );

        if (redirectImport) {
          // Store the local name of redirect for checking
          context.markVariable?.(redirectImport.local.name, "redirect");
        }
      },
    };
  },
};
